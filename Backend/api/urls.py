# api/urls.py
from django.urls import path, include
from .views import CambiarPasswordView, SolicitarResetPasswordView, ConfirmarResetPasswordView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegistroView, UsuarioViewSet, SocioViewSet, 
    PlanMembresiaViewSet, VentaViewSet, ProductoViewSet, 
    EjercicioViewSet, RutinaViewSet
)

# Configuración del Router para los ViewSets
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'socios', SocioViewSet)
router.register(r'planes', PlanMembresiaViewSet)
router.register(r'ventas', VentaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'ejercicios', EjercicioViewSet)
router.register(r'rutinas', RutinaViewSet)

urlpatterns = [
    # Rutas de Autenticación
    path('auth/registro/', RegistroView.as_view(), name='registro'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/cambiar-password/', CambiarPasswordView.as_view(), name='cambiar_password'),
    path('auth/solicitar-reset/', SolicitarResetPasswordView.as_view(), name='solicitar_reset'),
    path('auth/confirmar-reset/<uidb64>/<token>/', ConfirmarResetPasswordView.as_view(), name='confirmar_reset'),
    # Rutas generadas por el Router
    path('', include(router.urls)),
]