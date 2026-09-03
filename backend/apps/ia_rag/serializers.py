"""
Serializers para Endpoints de IA e RAG.
"""

from rest_framework import serializers


class RAGSearchRequestSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=500, required=True)
    target_specialty = serializers.CharField(max_length=50, required=False, allow_blank=True)
    top_k = serializers.IntegerField(default=3, min_value=1, max_value=10)


class SemanticRouteRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000, required=True)
    history = serializers.ListField(child=serializers.DictField(), required=False, default=list)
