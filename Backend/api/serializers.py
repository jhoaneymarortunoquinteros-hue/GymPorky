# api/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Usuario,Socio,PlanMembresia,Venta,Producto,Ejercicio,Rutina

Usuario = get_user_model()

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ['username', 'email', 'password', 'password2', 'ci', 'telefono', 'es_socio', 'es_entrenador', 'es_recepcionista', 'es_administrador']

    def validate(self, attrs):
        # Las contraseñas deben coincidir
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({'password2': 'Las contraseñas no coinciden.'})
        return attrs

    def validate_password(self, value):
        # Requisitos estrictos se aplican AL REGISTRARSE (mismos que en el reset)
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        # create_user hashea la contraseña automáticamente (PBKDF2 + salt)
        validated_data.pop('password2', None)
        user = Usuario.objects.create_user(**validated_data)
        return user


class UsuarioSerializer(serializers.ModelSerializer):
    # La contraseña solo es de escritura y SIEMPRE se guarda hasheada
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = '__all__'

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)  # Hash automático (PBKDF2 + salt)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)  # Hash automático
        instance.save()
        return instance

class SocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socio
        fields = '__all__'

class PlanMembresiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanMembresia
        fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'

class EjercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ejercicio
        fields = '__all__'

class RutinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rutina
        fields = '__all__'