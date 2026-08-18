<?php

/**
 * Shared HMAC signing client, included by each of the endpoint scripts in
 * this folder (get-products.php, get-product.php, get-inventory.php,
 * place-order.php). Signature scheme matches lib/auth/hmac.ts exactly:
 *
 *   message   = "{timestamp}.{METHOD}.{path}.{rawBody}"
 *   signature = hex(HMAC_SHA256(clientSecret, message))
 *
 * sent as the X-Client-Id / X-Timestamp / X-Signature headers.
 *
 * Override the merchant or target server with env vars:
 *   DEMO_API_BASE_URL=http://localhost:3000 \
 *   DEMO_API_CLIENT_ID=mch_... \
 *   DEMO_API_CLIENT_SECRET=sk_... \
 *   php get-products.php
 */

$baseUrl = getenv('DEMO_API_BASE_URL') ?: 'http://localhost:3000';
$clientId = getenv('DEMO_API_CLIENT_ID') ?: 'mch_8840f262b48d9493';
$clientSecret = getenv('DEMO_API_CLIENT_SECRET') ?: 'sk_c3627ab56b1b1c83fd2d2404289aded96bd6682a2f2c6953';

function signMessage($clientSecret, $timestamp, $method, $path, $body) {
    $message = "$timestamp.$method.$path.$body";
    return hash_hmac('sha256', $message, $clientSecret);
}

// $bodyData: null for a bodyless GET, or an array to be JSON-encoded for POST.
// Returns an array like ['status' => 200, 'body' => [...]].
function callSignedEndpoint($baseUrl, $clientId, $clientSecret, $method, $path, $bodyData = null) {
    // The exact string we sign must be byte-identical to what we send —
    // build it once and reuse it for both.
    $rawBody = $bodyData !== null ? json_encode($bodyData, JSON_UNESCAPED_SLASHES) : '';
    $timestamp = (string) (int) round(microtime(true) * 1000);
    $signature = signMessage($clientSecret, $timestamp, $method, $path, $rawBody);

    $headers = [
        'X-Client-Id: ' . $clientId,
        'X-Timestamp: ' . $timestamp,
        'X-Signature: ' . $signature,
    ];
    if ($bodyData !== null) {
        $headers[] = 'Content-Type: application/json';
    }

    $ch = curl_init($baseUrl . $path);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POSTFIELDS => $bodyData !== null ? $rawBody : null,
    ]);

    $responseBody = curl_exec($ch);
    if ($responseBody === false) {
        $error = curl_error($ch);
        curl_close($ch);
        die("cURL request to $path failed: $error\n");
    }

    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['status' => $status, 'body' => json_decode($responseBody, true)];
}

function printResult($label, $result) {
    echo "== $label ==\n";
    echo "Status: {$result['status']}\n";
    echo json_encode($result['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
}
