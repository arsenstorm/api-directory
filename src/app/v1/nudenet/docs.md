# NudeNet API

NudeNet is a simple nudity detection API.

## Classification

NudeNet classifies images into one of the following categories:

### Face and Upper Body

- FACE_FEMALE
- FACE_MALE
- ARMPITS_COVERED
- ARMPITS_EXPOSED
- FEMALE_BREAST_COVERED
- FEMALE_BREAST_EXPOSED
- MALE_BREAST_EXPOSED

### Lower Body

- BUTTOCKS_COVERED
- BUTTOCKS_EXPOSED
- ANUS_COVERED
- ANUS_EXPOSED
- FEMALE_GENITALIA_COVERED
- FEMALE_GENITALIA_EXPOSED
- MALE_GENITALIA_EXPOSED

### Other Body Parts

- BELLY_COVERED
- BELLY_EXPOSED
- FEET_COVERED
- FEET_EXPOSED

NudeNet also returns a bounding box around the detected parts.

Sample response:

```json
{
  "prediction": [
    [
      {
        "class": "BELLY_EXPOSED",
        "score": 0.8511635065078735,
        "box": [71, 182, 31, 50]
      },
      {
        "class": "FACE_FEMALE",
        "score": 0.8033977150917053,
        "box": [83, 69, 21, 37]
      },
      {
        "class": "FEMALE_BREAST_EXPOSED",
        "score": 0.7963727712631226,
        "box": [85, 137, 24, 38]
      },
      {
        "class": "FEMALE_BREAST_EXPOSED",
        "score": 0.7709134817123413,
        "box": [63, 136, 20, 37]
      },
      {
        "class": "ARMPITS_EXPOSED",
        "score": 0.7005534172058105,
        "box": [60, 127, 10, 20]
      },
      {
        "class": "FEMALE_GENITALIA_EXPOSED",
        "score": 0.6804671287536621,
        "box": [81, 241, 14, 24]
      }
    ]
  ],
  "success": true
}
```

## Sending a request

To make a request, you can either send a JSON body or use form data.

### Using JSON

Send a POST request to the `/v1/nudenet` endpoint with a JSON body containing
the image URL.

Sample request:

```json
{
  "url": "https://example.com/image.jpg"
}
```

### Using Form Data

Send a POST request to the `/v1/nudenet` endpoint with a form data body
containing the image file in the `image` field.

Sample request:

```
curl -X POST https://request.directory/v1/nudenet \
  -H "Content-Type: multipart/form-data" \
  -F "image=@path/to/image.jpg"
```

## Notes

NudeNet is open-source and available on [GitHub](https://github.com/notai-tech/nudenet).
