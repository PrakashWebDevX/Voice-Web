import Anthropic from '@anthropic-ai/sdk';
import { CodeType } from '../models/Generation';
import { SYSTEM_PROMPTS, buildGenerationPrompt, buildTitlePrompt, EXPLAIN_PROMPT } from '../utils/prompts';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string, inputTokens: number, outputTokens: number) => void;
  onError: (error: Error) => void;
}

export async function streamGeneration(
  prompt: string,
  codeType: CodeType,
  callbacks: StreamCallbacks
): Promise<void> {
  let fullText = '';

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPTS[codeType],
      messages: [
        {
          role: 'user',
          content: buildGenerationPrompt(prompt, codeType),
        },
      ],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        const token = chunk.delta.text;
        fullText += token;
        callbacks.onToken(token);
      }
    }

    const finalMessage = await stream.finalMessage();
    callbacks.onComplete(
      fullText,
      finalMessage.usage.input_tokens,
      finalMessage.usage.output_tokens
    );
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error('Stream failed'));
  }
}

export async function generateTitle(prompt: string): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 50,
      messages: [{ role: 'user', content: buildTitlePrompt(prompt) }],
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text.trim() : 'Generated Code';
  } catch {
    return 'Generated Code';
  }
}

export async function explainCode(code: string): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: EXPLAIN_PROMPT,
      messages: [{ role: 'user', content: `Explain this code:\n\n${code}` }],
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text : 'Unable to generate explanation.';
  } catch (err) {
    throw new Error('Failed to explain code');
  }
}
