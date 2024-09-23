# Face Landmarks API

The Face Landmarks API is a simple visual classifier that identifies a face's landmarks and returns them.

## Sending a request

To make a request, you can either send a JSON body or use form data.

### Using JSON

Send a POST request to the `/v1/facelandmarks` endpoint with a JSON body containing
the image URL.

Sample request:

```json
{
  "url": "https://example.com/image.jpg"
}
```

### Using Form Data

Send a POST request to the `/v1/facelandmarks` endpoint with a form data body
containing the image file in the `image` field.

Sample request:

```
curl -X POST https://request.directory/v1/facelandmarks \
  -H "Content-Type: multipart/form-data" \
  -F "image=@path/to/image.jpg"
```

### Response

```json
{
  "bounds": {
    "x1": 339,
    "x2": 670,
    "y1": 188,
    "y2": 605
  },
  "confidence": 0.9646592140197754,
  "face": {
    "left_eye": {
      "x": 425,
      "y": 375
    },
    "left_mouth": {
      "x": 476,
      "y": 494
    },
    "nose": {
      "x": 518,
      "y": 412
    },
    "right_eye": {
      "x": 560,
      "y": 315
    },
    "right_mouth": {
      "x": 615,
      "y": 438
    }
  },
  "image": "/9j/4AAQSkZJRgA...", // shortened for brevity
  "landmarks": [
    {
      "x": 362,
      "y": 395
    },
    // ...
    {
      "x": 550,
      "y": 324
    }
  ],
  "success": true
}
```

## Notes

The version of Face Landmarks used in Request Directory is open-source and available on [GitHub](https://github.com/arsenstorm/request-directory-apis).

