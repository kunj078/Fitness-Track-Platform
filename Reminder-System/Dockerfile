# Build 
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# cache dependencies
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline

# Build
COPY src ./src
RUN ./mvnw -q -DskipTests package

#  Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

ENV PORT=8080
EXPOSE 8080

# Copy the jar file 
COPY --from=build /app/target/*.jar /app/app.jar


ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]