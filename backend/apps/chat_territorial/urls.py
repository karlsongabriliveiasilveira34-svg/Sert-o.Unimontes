from django.urls import path, re_path
from .views import (
    BioAgentsListView,
    LocationsListView,
    ChatMessageView,
    ChatHistoryView,
    ChatLocationView,
)

urlpatterns = [
    re_path(r"^message/?$", ChatMessageView.as_view(), name="chat-message"),
    re_path(r"^history/(?P<session_id>[\w\-]+)/?$", ChatHistoryView.as_view(), name="chat-history"),
    re_path(r"^location/?$", ChatLocationView.as_view(), name="chat-location"),
]
