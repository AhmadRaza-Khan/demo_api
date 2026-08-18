<?php

// GET /api/v6/products/{id} — HMAC-signed, no auth token involved.
// Run: php get-product.php [id]   (id defaults to 1)

require __DIR__ . '/client.php';

$productId = $argv[1] ?? 1;

$result = callSignedEndpoint($baseUrl, $clientId, $clientSecret, 'GET', "/api/v6/products/$productId");
printResult("GET /api/v6/products/$productId", $result);
