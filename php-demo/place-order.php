<?php

// POST /api/v6/order — HMAC-signed, no auth token involved.
//
// orderId is the merchant's own order reference (required on every order).
// Reusing one you've already submitted is NOT an error — the API returns
// 200 with a "warning" instead of creating a duplicate.
//
// Run: php place-order.php [orderId] [productId] [quantity]
//   php place-order.php                       -> orderId "php-demo-order-001", run twice to see the warning
//   php place-order.php ORD-42 2 3             -> custom orderId, 3x product 2

require __DIR__ . '/client.php';

$orderId = $argv[1] ?? 'php-demo-order-001';
$productId = (int) ($argv[2] ?? 1);
$quantity = (int) ($argv[3] ?? 2);

$result = callSignedEndpoint($baseUrl, $clientId, $clientSecret, 'POST', '/api/v6/order', [
    'orderId' => $orderId,
    'customer' => ['name' => 'PHP Demo Customer', 'email' => 'php-demo@example.com'],
    'items' => [
        ['productId' => $productId, 'quantity' => $quantity],
    ],
]);
printResult('POST /api/v6/order', $result);
