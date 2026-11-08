import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatService } from '../services/chatService';
import { useChat as useChatCtx } from '../context/ChatContext';

export const useChatActions = () => {
  const {
    addUserMessage,
    startAssistantMessage,
    addAssistantMessage,
    updateStreamingMessage,
    finalizeStreamingMessage,
    conversationId,
    selectedDocumentId,
    setConversationId,
    setIsStreaming,
    isStreaming,
  } = useChatCtx();

  const sendMessage = useCallback(
    (question: string, useStream = true) => {
      if (isStreaming) return;

      addUserMessage(question);
      const assistantId = uuidv4();
      startAssistantMessage(assistantId);

      const req = { question, conversationId, documentId: selectedDocumentId };

      if (useStream) {
        setIsStreaming(true);
        let accumulated = '';
        const cleanup = chatService.streamQuestion(
          req,
          (chunk) => {
            accumulated += chunk;
            updateStreamingMessage(assistantId, accumulated);
          },
          () => {
            finalizeStreamingMessage(assistantId);
            setIsStreaming(false);
          },
          (e) => {
            updateStreamingMessage(assistantId, `Error: ${e.message}`);
            finalizeStreamingMessage(assistantId);
            setIsStreaming(false);
          }
        );
        return cleanup;
      } else {
        setIsStreaming(true);
        chatService
          .askQuestion(req)
          .then((res) => {
            if (res.conversationId) setConversationId(res.conversationId);
            addAssistantMessage(assistantId, res.answer, res.citations, res.responseTimeMs);
          })
          .catch((e) => {
            addAssistantMessage(assistantId, `Error: ${e.message}`);
          })
          .finally(() => setIsStreaming(false));
      }
    },
    [
      isStreaming,
      addUserMessage,
      startAssistantMessage,
      addAssistantMessage,
      updateStreamingMessage,
      finalizeStreamingMessage,
      conversationId,
      selectedDocumentId,
      setConversationId,
      setIsStreaming,
    ]
  );

  return { sendMessage };
};
