<?php

// GET /api/v6/products — HMAC-signed, no auth token involved.
// Run: php get-products.php

require __DIR__ . '/client.php';

$result = callSignedEndpoint($baseUrl, $clientId, $clientSecret, 'GET', '/api/v6/products');
printResult('GET /api/v6/products', $result);
