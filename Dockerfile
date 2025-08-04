# Use Python alpine image for smaller size
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Copy your website files
COPY . .

# Expose port 8787
EXPOSE 8787

# Start Python HTTP server on port 8787
CMD ["python", "-m", "http.server", "8787"]