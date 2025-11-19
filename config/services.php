<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'n8n' => [
        'send_flight_to_pms' => env('N8N_SEND_FLIGHT_TO_PMS', 'https://n8n.larable.dev/webhook/send-flight-to-pms'),
        'get_bookings' => env('N8N_GET_BOOKINGS', 'https://n8n.larable.dev/webhook/flights'),
        'get_notams' => env('N8N_GET_NOTAMS', 'https://n8n.larable.dev/webhook/notams'),
        'get_baggages' => env('N8N_GET_BAGGAGES', 'https://n8n.larable.dev/webhook/baggages'),
        'get_checked_in' => env('N8N_GET_CHECKED_IN', 'https://n8n.larable.dev/webhook/checked-in'),
        'weather_lookup' => env('N8N_GET_WEATHER', 'https://n8n.larable.dev/webhook/eb549b24-047c-4a02-a9b3-eeb33f8e7a11'),
    ],

];
