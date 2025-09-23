# Multi-stage build para optimizar el tamaño de la imagen
FROM openjdk:21-jdk-slim AS build

# Instalar Maven
RUN apt-get update && apt-get install -y maven

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de Maven
COPY pom.xml .

# Descargar dependencias (se cachea esta capa si pom.xml no cambia)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY src ./src

# Compilar aplicación
RUN mvn clean package -DskipTests

# Imagen de producción
FROM openjdk:21-jdk-slim

# Crear usuario no-root para seguridad
RUN addgroup --system spring && adduser --system spring --ingroup spring

# Crear directorio de la aplicación
WORKDIR /app

# Crear directorio para uploads
RUN mkdir -p /app/uploads && chown -R spring:spring /app

# Copiar JAR desde la etapa de build
COPY --from=build /app/target/*.jar app.jar

# Cambiar al usuario no-root
USER spring:spring

# Exponer puerto 8082
EXPOSE 8082

# Variables de entorno por defecto
ENV SPRING_PROFILES_ACTIVE=coolify
ENV SERVER_PORT=8082
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# Comando de inicio
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]