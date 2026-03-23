<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'CORS preflight OK',
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed',
    ]);
    exit;
}

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$envFile = __DIR__ . '/../.env';
$env = is_file($envFile) ? parse_ini_file($envFile, false, INI_SCANNER_RAW) : [];
$smtpPassword = trim($env['SMTP_APP_PASSWORD'] ?? '');

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$input = [];

if (stripos($contentType, 'application/json') !== false) {
    $rawInput = file_get_contents('php://input');
    $decoded = json_decode($rawInput, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON payload',
        ]);
        exit;
    }

    $input = is_array($decoded) ? $decoded : [];
}
else {
    $input = $_POST;
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$company = trim($input['company'] ?? '');
$warehouses = trim($input['warehouses'] ?? '');
$reason = trim($input['reason'] ?? '');
$message = trim($input['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Name, email, and message are required',
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email address',
    ]);
    exit;
}

$to = 'chetan.m@elsner.com';
$subject = 'New Contact Inquiry';

$emailBody = "Name: {$name}\n"
    . "Email: {$email}\n"
    . "Phone: " . ($phone !== '' ? $phone : 'Not provided') . "\n"
    . "Company: " . ($company !== '' ? $company : 'Not provided') . "\n"
    . "Warehouses: " . ($warehouses !== '' ? $warehouses : 'Not provided') . "\n"
    . "Reason: " . ($reason !== '' ? $reason : 'Not provided') . "\n"
    . "Message:\n{$message}";

$headers = [
    'From: chetan.m@elsner.com',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

$mailSent = @mail($to, $subject, $emailBody, implode("\r\n", $headers));

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully using PHP mail()',
    ]);
    exit;
}

$mail = new PHPMailer(true);

try {
    if ($smtpPassword === '') {
        throw new Exception('SMTP_APP_PASSWORD is missing from .env');
    }

    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'chetan.m@elsner.com';
    $mail->Password = $smtpPassword;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('chetan.m@elsner.com', 'Tiles WMS Contact');
    $mail->addAddress('chetan.m@elsner.com');
    $mail->addReplyTo($email, $name);

    $mail->isHTML(false);
    $mail->Subject = $subject;
    $mail->Body = $emailBody;

    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully using SMTP fallback',
    ]);
    exit;
}
catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Both PHP mail() and SMTP failed. SMTP Error: ' . $mail->ErrorInfo,
    ]);
    exit;
}
