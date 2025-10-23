<?php
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

// Получаем все уникальные файлы
$stmt = $pdo->query("SELECT id, name, data_json FROM pages");
$allFiles = [];

while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $data = json_decode($row['data_json'], true);
    
    // 1. Поиск в структурированных данных
    foreach($data['elements'] ?? [] as $element) {
        if(strtolower($element['type'] ?? '') === 'filebtn') {
            $url = $element['fileUrl'] ?? '';
            $name = $element['fileName'] ?? basename($url);
            
            if($url && $url !== '#') {
                if(!isset($allFiles[$url])) {
                    $allFiles[$url] = [
                        'url' => $url,
                        'name' => $name,
                        'pages' => []
                    ];
                }
                if(!in_array($row['name'], $allFiles[$url]['pages'])) {
                    $allFiles[$url]['pages'][] = $row['name'];
                }
            }
        }
        
        // 2. Поиск в HTML-контенте элементов (НОВОЕ!)
        if(!empty($element['html'])) {
            $htmlButtons = HtmlButtonParser::extractFileButtons($element['html']);
            
            foreach($htmlButtons as $btn) {
                $url = $btn['url'];
                $name = $btn['fileName'];
                
                if($url && $url !== '#') {
                    if(!isset($allFiles[$url])) {
                        $allFiles[$url] = [
                            'url' => $url,
                            'name' => $name,
                            'pages' => []
                        ];
                    }
                    if(!in_array($row['name'], $allFiles[$url]['pages'])) {
                        $allFiles[$url]['pages'][] = $row['name'];
                    }
                }
            }
        }
    }
}

echo json_encode([
    'ok' => true,
    'files' => array_values($allFiles)
], JSON_UNESCAPED_UNICODE);