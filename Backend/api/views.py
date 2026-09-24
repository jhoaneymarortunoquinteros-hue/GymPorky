# api/views.py
from django.conf import settings
from decouple import config
from rest_framework import status, permissions, viewsets  # <--- Se agregó viewsets aquí
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .emails import enviar_correo_brevo

from rest_framework.permissions import AllowAny
from .models import Usuario, Socio, PlanMembresia, Venta, Producto, Ejercicio, Rutina
from .serializers import (
    RegistroUsuarioSerializer, UsuarioSerializer, SocioSerializer, 
    PlanMembresiaSerializer, VentaSerializer, ProductoSerializer, 
    EjercicioSerializer, RutinaSerializer
)

User = get_user_model()

# 1. Cambiar contraseña cuando está logueado
class CambiarPasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        password_actual = request.data.get('password_actual')
        password_nueva = request.data.get('password_nueva')

        if not user.check_password(password_actual):
            return Response({'error': 'La contraseña actual es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password_nueva, user)
        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password_nueva)  # Se encripta automáticamente
        user.save()
        return Response({'mensaje': 'Contraseña actualizada con éxito.'})

# 2. Solicitar correo de recuperación (Olvidé mi contraseña)
class SolicitarResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        user = User.objects.filter(email=email).first()

        # Por seguridad devolvemos siempre el mismo mensaje genérico
        # (no revelar si el correo existe en el sistema).
        if user is not None and not user.is_active:
            user = None

        if user is not None:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            frontend_url = config('FRONTEND_URL', default='http://localhost:3000').rstrip('/')
            link_recuperacion = f"{frontend_url}/reset-password/{uid}/{token}/"

            asunto = 'Recuperación de contraseña — Porky Gym'
            contenido = (
                '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">'
                f'<h2 style="color:#111">Hola {user.username},</h2>'
                '<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>'
                '<p style="margin:24px 0">'
                f'<a href="{link_recuperacion}" style="background:#E2FF00;color:#111;padding:12px 24px;'
                'text-decoration:none;font-weight:bold;border-radius:4px">'
                'Restablecer mi contraseña</a></p>'
                '<p>Si no solicitaste este cambio, ignora este correo; tu contraseña '
                'seguirá siendo la misma.</p>'
                '<hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>'
                '<p style="color:#777;font-size:12px">Porky Gym • Sistema de gestión</p>'
                '</div>'
            )

            enviado = enviar_correo_brevo(email, asunto, contenido)

            if not enviado:
                # Fallback de desarrollo: se imprime el enlace en la consola del backend.
                print(f"LINK DE RECUPERACIÓN (no se pudo enviar correo): {link_recuperacion}")
                if settings.DEBUG:
                    return Response({
                        'mensaje': 'No se pudo enviar el correo (revisa BREVO_API_KEY). '
                                   'En modo desarrollo, usa el enlace de abajo.',
                        'debug_link': link_recuperacion,
                    })

        return Response({'mensaje': 'Si existe una cuenta con ese correo, '
                                    'recibirás un enlace de recuperación.'})

# 3. Confirmar la nueva contraseña mediante el token
class ConfirmarResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Enlace inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            password_nueva = request.data.get('password_nueva')
            password_confirmacion = request.data.get('password_confirmacion')

            if not password_nueva or password_nueva != password_confirmacion:
                return Response({'error': 'Las contraseñas no coinciden.'}, status=status.HTTP_400_BAD_REQUEST)

            # Los requisitos de complejidad se aplican AQUÍ (al elegir la nueva contraseña)
            try:
                validate_password(password_nueva, user)
            except ValidationError as e:
                return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(password_nueva)  # Se almacena hasheada automáticamente
            user.save()
            return Response({'mensaje': 'Tu contraseña ha sido restablecida exitosamente.'})
        return Response({'error': 'El token no es válido o ha expirado.'}, status=status.HTTP_400_BAD_REQUEST)

# 4. Registro de Usuario
class RegistroView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"mensaje": "Usuario registrado exitosamente"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 5. ViewSets del sistema Porky Gym
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class SocioViewSet(viewsets.ModelViewSet):
    queryset = Socio.objects.all()
    serializer_class = SocioSerializer

class PlanMembresiaViewSet(viewsets.ModelViewSet):
    queryset = PlanMembresia.objects.all()
    serializer_class = PlanMembresiaSerializer

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class EjercicioViewSet(viewsets.ModelViewSet):
    queryset = Ejercicio.objects.all()
    serializer_class = EjercicioSerializer

class RutinaViewSet(viewsets.ModelViewSet):
    queryset = Rutina.objects.all()
    serializer_class = RutinaSerializer