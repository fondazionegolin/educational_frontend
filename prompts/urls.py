from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/translate/', views.translate, name='translate'),
    path('api/submit/', views.submit, name='submit'),
    path('api/prompts/<str:user_code>/', views.get_prompts, name='get_prompts'),
    path('api/translate_prompts/', views.translate_prompts, name='translate_prompts'),
]
