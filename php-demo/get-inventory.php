<?php

// GET /api/v6/inventory — HMAC-signed, no auth token involved.
// Quantities shift a little on every call, so run this more than once.
// Run: php get-inventory.php

require __DIR__ . '/client.php';

$result = callSignedEndpoint($baseUrl, $clientId, $clientSecret, 'GET', '/api/v6/inventory');
printResult('GET /api/v6/inventory', $result);
