from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/submit/', views.submit, name='submit'),
    path('prompts/<str:user_code>/', views.get_prompts, name='get_prompts'),
]
