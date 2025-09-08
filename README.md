# VReal Testing Example

A simple google drive project demonstrating an api, client, and database setup using Docker.

## Prerequisites

- Docker
- Docker Compose

## How to run

Build and start the containers with:

```bash
docker-compose up --build
```

## Access Information

- API: http://localhost:3000
- Client: http://localhost:5173
- Database: PostgreSQL on port 5432

## Additional Information

- Auth through Google.
- Pretty UI
- File upload
- Support hierarchy with the ability to create a folder system with nested folders and files
- Files can be stored as public or private
- Support file accessibility for viewing
- Support ability to grant users access with chosen permissions(by email) to edit or view files or folders(using token)
- Search files & folders by name
- Management system for files and folders (clone, remove, rename)
- Users can view the files/folders available to them created by another user via the link (optional)
