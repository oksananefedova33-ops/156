<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

// Подключаем универсальный парсер
require_once dirname(__DIR__) . '/common/HtmlButtonParser.php';

$db = dirname(dirname(__DIR__)) . '/data/zerro_blog.db';

if(!file_exists($db)) {
    echo json_encode(['ok' => false, 'error' => 'База данных не найдена']);
    exit;
}

try {
    $pdo = new PDO('sqlite:' . $db);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(Throwable $e) {
    echo json_encode(['ok' => false, 'error' => 'Ошибка подключения к БД']);
    exit;
}

$action = $_POST['action'] ?? '';

if ($action === 'search') {
    $query = trim($_POST['query'] ?? '');
    
    if(empty($query)) {
        echo json_encode(['ok' => false, 'error' => 'Запрос не указан']);
        exit;
    }
    
    $stmt = $pdo->query("SELECT id, name, data_json FROM pages");
    $totalCount = 0;
    $pageCount = 0;
    $details = [];
    $allFiles = [];
    
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $data = json_decode($row['data_json'], true);
        $pageFiles = [];
        
        // 1. Поиск в структурированных данных (старый способ)
        foreach($data['elements'] ?? [] as $element) {
            if(strtolower($element['type'] ?? '') === 'filebtn') {
                $fileUrl = $element['fileUrl'] ?? '';
                $fileName = $element['fileName'] ?? basename($fileUrl);
                
                if(stripos($fileUrl, $query) !== false || stripos($fileName, $query) !== false) {
                    $pageFiles[] = [
                        'url' => $fileUrl,
                        'name' => $fileName,
                        'source' => 'structured'
                    ];
                }
            }
            
            // 2. Поиск в HTML-контенте элементов (НОВОЕ!)
            if(!empty($element['html'])) {
                $htmlButtons = HtmlButtonParser::extractFileButtons($element['html']);
                
                foreach($htmlButtons as $btn) {
                    if(stripos($btn['url'], $query) !== false || stripos($btn['fileName'], $query) !== false) {
                        $pageFiles[] = [
                            'url' => $btn['url'],
                            'name' => $btn['fileName'],
                            'source' => 'html'
                        ];
                    }
                }
            }
        }
        
        // Убираем дубликаты по URL
        $uniqueFiles = [];
        foreach($pageFiles as $file) {
            $uniqueFiles[$file['url']] = $file;
        }
        $pageFiles = array_values($uniqueFiles);
        
        if(count($pageFiles) > 0) {
            $totalCount += count($pageFiles);
            $pageCount++;
            $details[] = [
                'page_id' => $row['id'],
                'page_name' => $row['name'],
                'count' => count($pageFiles)
            ];
            
            $allFiles = array_merge($allFiles, $pageFiles);
        }
    }
    
    // Убираем глобальные дубликаты
    $uniqueAllFiles = [];
    foreach($allFiles as $file) {
        $uniqueAllFiles[$file['url']] = $file;
    }
    $allFiles = array_values($uniqueAllFiles);
    
    echo json_encode([
        'ok' => true,
        'count' => $totalCount,
        'pages' => $pageCount,
        'details' => $details,
        'files' => $allFiles
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'replace') {
    $oldUrl = trim($_POST['oldUrl'] ?? '');
    $newUrl = trim($_POST['newUrl'] ?? '');
    $fileName = trim($_POST['fileName'] ?? '');
    $currentPageId = (int)($_POST['current_page'] ?? 0);
    
    if(empty($oldUrl) || empty($newUrl)) {
        echo json_encode(['ok' => false, 'error' => 'URL не указаны']);
        exit;
    }
    
    $replaced = 0;
    $currentPageAffected = false;
    
    $pdo->beginTransaction();
    
    try {
        $stmt = $pdo->query("SELECT id, data_json FROM pages");
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data = json_decode($row['data_json'], true);
            $changed = false;
            
            // 1. Замена в структурированных данных
            for($i = 0; $i < count($data['elements'] ?? []); $i++) {
                if(strtolower($data['elements'][$i]['type'] ?? '') === 'filebtn') {
                    $currentUrl = $data['elements'][$i]['fileUrl'] ?? '';
                    
                    if($currentUrl === $oldUrl || basename($currentUrl) === basename($oldUrl)) {
                        $data['elements'][$i]['fileUrl'] = $newUrl;
                        if($fileName) {
                            $data['elements'][$i]['fileName'] = $fileName;
                        }
                        $replaced++;
                        $changed = true;
                        
                        if($row['id'] == $currentPageId) {
                            $currentPageAffected = true;
                        }
                    }
                }
                
                // 2. Замена в HTML-контенте (НОВОЕ!)
                if(!empty($data['elements'][$i]['html'])) {
                    list($newHtml, $count) = HtmlButtonParser::replaceFileUrls(
                        $data['elements'][$i]['html'],
                        $oldUrl,
                        $newUrl,
                        $fileName
                    );
                    
                    if($count > 0) {
                        $data['elements'][$i]['html'] = $newHtml;
                        $replaced += $count;
                        $changed = true;
                        
                        if($row['id'] == $currentPageId) {
                            $currentPageAffected = true;
                        }
                    }
                }
            }
            
            if($changed) {
                $updateStmt = $pdo->prepare("UPDATE pages SET data_json = :json WHERE id = :id");
                $updateStmt->execute([
                    ':json' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ':id' => $row['id']
                ]);
            }
        }
        
        $pdo->commit();
        
        echo json_encode([
            'ok' => true,
            'replaced' => $replaced,
            'current_page_affected' => $currentPageAffected
        ], JSON_UNESCAPED_UNICODE);
    } catch(Exception $e) {
        $pdo->rollBack();
        echo json_encode(['ok' => false, 'error' => 'Ошибка замены: ' . $e->getMessage()]);
    }
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Неизвестное действие']);