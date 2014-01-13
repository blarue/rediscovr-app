<?php
define('S3_BUCKET_NAME', 'thecrack');
define('S3_SECRET_KEY', 'ez+Yp4+W0Vdw9IQ/WI+kIhSzsX5+/P4VdENbCmvJ');
define('S3_ACCESS_KEY', 'AKIAIZEB3CDGI3RET5XQ');
define('S3_URL', 'http://s3.amazonaws.com/');

$object_name = trim($_GET['s3_object_name']);
$mime_type = trim($_GET['s3_object_type']);
$expires = time() + 100; // PUT request to S3 must start within 100 seconds
$amz_headers = "x-amz-acl:public-read"; // set the public read permission on the uploaded file
$string_to_sign = "PUT\n\n{$mime_type}\n{$expires}\n{$amz_headers}\n/" . S3_BUCKET_NAME . "/{$object_name}";

$sig = base64_encode(hash_hmac('sha1', $string_to_sign, S3_SECRET_KEY, true));
$obj = array();
$obj = (object) $obj;
$obj->signed_request = urlencode(S3_URL . S3_BUCKET_NAME . "/{$object_name}?AWSAccessKeyId=" . S3_ACCESS_KEY . "&Expires={$expires}&Signature={$sig}");
$obj->url = S3_URL . S3_BUCKET_NAME . "/{$object_name}";

echo json_encode($obj);