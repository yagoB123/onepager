<?php
// Set response header
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get form data
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);
$to = filter_input(INPUT_POST, 'send_to_mail', FILTER_SANITIZE_EMAIL);

// Validate input
if (empty($name) || empty($email) || empty($message) || empty($to)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Vul alle verplichte velden in']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);n    echo json_encode(['success' => false, 'message' => 'Vul een geldig e-mailadres in']);
    exit;
}

// Set email headers
$headers = [
    'From' => $email,
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/plain; charset=UTF-8'
];

// Format email subject and body
$subject = "Nieuw contactformulier bericht van $name";
$emailBody = "Je hebt een nieuw bericht ontvangen via het contactformulier:\n\n";
$emailBody .= "Naam: $name\n";
$emailBody .= "E-mail: $email\n\n";
$emailBody .= "Bericht:\n$message\n";

// Send email
$mailSent = mail($to, $subject, $emailBody, $headers);

if ($mailSent) {
    http_response_code(200);
    echo json_encode([
        'success' => true, 
        'message' => 'Bedankt voor je bericht! Ik neem zo snel mogelijk contact met je op.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Er is een fout opgetreden bij het verzenden van het bericht. Probeer het later opnieuw.'
    ]);
}
?>
