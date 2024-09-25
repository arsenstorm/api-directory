# Age and Gender API

The Age and Gender API is a simple visual classifier that identifies faces
and returns their age and gender.

## Sending a request

To make a request, you can either send a JSON body or use form data.

### Using JSON

Send a POST request to the `/v1/ageandgender` endpoint with a JSON body
containing the image URL.

Sample request:

```json
{
  "url": "https://example.com/image.jpg"
}
```

### Using Form Data

Send a POST request to the `/v1/ageandgender` endpoint with a form data body
containing the image file in the `image` field.

Sample request:

```
curl -X POST https://request.directory/v1/ageandgender \
  -H "Content-Type: multipart/form-data" \
  -F "image=@path/to/image.jpg"
```

### Response

```json
{
  "faces": [
    {
      "age": "(25-32)",
      "bounds": {
        "x1": 230,
        "x2": 383,
        "y1": 57,
        "y2": 252
      },
      "gender": "Female"
    }
  ],
  "image": "https://xjzkfvupajmegrueevjp.supabase.co/storage/...", // shortened for brevity
  "success": true
}
```

### Returned Image URL

The returned image URL is a direct link to the image stored in Supabase. It is
valid for 24 hours, after which it will expire and be deleted.

In the non-hosted version, the image will be a base64 encoded string.

### Returned Faces

The `faces` field contains an array of faces detected in the image. Each face
contains the following fields:

- `age`: The age of the person in the image.
- `bounds`: The bounding box of the face in the image.
- `gender`: The gender of the person in the image.

## Notes

The version of Age and Gender used in Request Directory is open-source and
available on [GitHub](https://github.com/arsenstorm/request-directory-apis).
