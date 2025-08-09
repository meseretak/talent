# Freelancer Registration Endpoint

**URL**: `http://localhost:4000/api/v1/freelancers/register`

**Method**: `POST`

## Request Body

```json
{
  "email": "freelancerwith@example.com",
  "password": "password1",
  "firstName": "Jane",
  "lastName": "Smith",
  "headline": "Senior Web Developer",
  "bio": "Experienced web developer with 8+ years in React and Node.js",
  "skills": [
    "1",
    "2",
    "3"
  ],
  "categories": [
    "1",
    "2"
  ],
  "availability": {
    "status": "AVAILABLE",
    "availableHoursPerWeek": 30,
    "notes": "Available for immediate start"
  }
}
```

## Response

```json
{
  "user": {
    "id": 7,
    "email": "freelancerwith@example.com",
    "firstName": "Jane",
    "middleName": "",
    "lastName": "Smith",
    "role": "FREELANCER",
    "isEmailVerified": false,
    "provider": null,
    "providerId": null,
    "avatar": null,
    "status": "ACTIVE",
    "clientId": null
  },
  "freelancer": {
    "id": 2,
    "userId": 7,
    "headline": "Senior Web Developer",
    "bio": "Experienced web developer with 8+ years in React and Node.js",
    "about": "",
    "skillIds": [],
    "categoryIds": [],
    "status": "PENDING",
    "createdAt": "2025-03-23T22:33:00.518Z",
    "updatedAt": "2025-03-23T22:33:00.518Z",
    "availabilityId": 2,
    "statisticsInformationId": 2,
    "terminationInformationId": null,
    "skills": [
      {
        "id": 1,
        "name": "VSL",
        "description": "VSL is One of the best Video Editing tool",
        "type": "VIDEO",
        "videoType": "VSL",
        "programmingType": null,
        "designType": null,
        "writingType": null,
        "marketingType": null
      },
      {
        "id": 2,
        "name": "UGC ",
        "description": "UGC is the best of all video type",
        "type": "VIDEO",
        "videoType": "UGC",
        "programmingType": null,
        "designType": null,
        "writingType": null,
        "marketingType": null
      },
      {
        "id": 3,
        "name": "DRA ",
        "description": "DRA my best set",
        "type": "VIDEO",
        "videoType": "DRA",
        "programmingType": null,
        "designType": null,
        "writingType": null,
        "marketingType": null
      }
    ],
    "categories": [
      {
        "id": 1,
        "name": "UGC Creators",
        "description": "UGC creators are the only video creators"
      },
      {
        "id": 2,
        "name": "AIV Creators",
        "description": "AIV creators are the video creators"
      }
    ],
    "availability": {
      "id": 2,
      "status": "AVAILABLE",
      "availableHoursPerWeek": 30,
      "unavailableUntil": null,
      "notes": "Available for immediate start"
    }
  }
}
```

