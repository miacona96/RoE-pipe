# River of Ebooks REST API
## Information on how to use the api endpoints to publish and view ebook metadata

### Publishing ebook metadata

```
POST to /api/publish containing headers:
{
  roe-key: <api key>,
  roe-secret: <api secret>
}

and opds2 publication body with type `application/json`:

{
  "metadata": {
    "@type": "http://schema.org/Book",
    "title": "Moby-Dick",
    "author": "Herman Melville",
    "identifier": "urn:isbn:978031600000X",
    "tags": "story,classic",
    "publisher": "Ebook Publisher.com",
    "language": "en",
    "modified": "2015-09-29T17:00:00Z"
  },
  "links": [
    {"rel": "self", "href": "http://example.org/manifest.json", "type": "application/webpub+json"}
  ],
  "images": [
    {"href": "http://example.org/cover.jpg", "type": "image/jpeg", "height": 1400, "width": 800},
    {"href": "http://example.org/cover-small.jpg", "type": "image/jpeg", "height": 700, "width": 400},
    {"href": "http://example.org/cover.svg", "type": "image/svg+xml"}
  ]
}
```

@Type must be `http://schema.org/Book`.
Each tuple of `(title, author, publisher, identifier, modified)` must be unique.

The server will respond with either:

```
200 OK
{
  "created_at": 1550102480021,
  "updated_at": 1550102480021,
  "id": number,
  "title": string,
  "author": string,
  "tags": array,
  "publisher": string,
  "identifier": string,
  "version": string,
  "opds": json
}
```

or

```
400 BAD REQUEST / 403 UNAUTHORIZED
{
  "error": string,
  "hint": string
}
```

### Fetching published books

GET from /api/catalog/all with the query string parameters:

```
title: The ebook's title (optional)
author: The author (optional)
version: A version number (optional)
isbn: The ISBN (optional)
tags: Comma-separated search tags (optional)

page: The page of results to view (200 results per page)
```

For example: `GET /api/catalog/all?title=foo&page=3`

The server will respond with either:

```
200 OK
{
  "metadata":{
    "title": "RoE all publications",
    "itemsPerPage": 200,
    "currentPage": 1
  },
  "links":[
    {
      "rel": "self",
      "href": "all?page=1",
      "type": "application/opds+json"
    }
    {
      "rel": "search",
      "href": "all{?title,author,version,isbn}",
      "type": "application/opds+json",
      "templated": true
    }
  ],
  "publications":[
    {
      "metadata":{
        "@type": "http://schema.org/Book",
        "title": "Moby-Dick",
        "author": "Herman Melville",
        "tags": "story,classic",
        "publisher": "Ebook Publisher.com",
        "identifier": "urn:isbn:978031600000X",
        "language": "en",
        "modified": "2015-09-29T17:00:00Z"
      },
      "links":[
        {
          "rel": "self",
          "href": "http://example.org/manifest.json",
          "type": "application/webpub+json"
        }
      ],
      "images":[
        {
          "href": "http://example.org/cover.jpg",
          "type": "image/jpeg",
          "height": 1400,
          "width": 800
        },
        {
          "href": "http://example.org/cover.svg",
          "type": "image/svg+xml"
        }
      ]
    }
  ]
}
```

or

```
404 NOT FOUND
{
  "error": string,
  "hint": string
}
```

### Receiving push notifications to your webhooks:

- Log in to the River of Ebooks website
- Add your webhook URL and desired filters

The server will send a POST request with the following body to the provided URL whenever a new ebook is published through the pipeline:

```
HTTP Headers:
  User-Agent: RoE-aggregator
  X-Roe-Request-Timestamp: number
  X-Roe-Signature: string

HTTP Body:
{
  "metadata":{
    "@type": "http://schema.org/Book",
    "title": "Moby-Dick",
    "author": "Herman Melville",
    "tags": "story,classic",
    "publisher": "Ebook Publisher.com",
    "identifier": "urn:isbn:978031600000X",
    "language": "en",
    "modified": "2015-09-29T17:00:00Z"
  },
  "links":[
    {
      "rel": "self",
      "href": "http://example.org/manifest.json",
      "type": "application/webpub+json"
    }
  ],
  "images":[
    {
      "href": "http://example.org/cover.jpg",
      "type": "image/jpeg",
      "height": 1400,
      "width": 800
    },
    {
      "href": "http://example.org/cover.svg",
      "type": "image/svg+xml"
    }
  ]
}
```
