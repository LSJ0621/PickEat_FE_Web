import type { AxiosError } from 'axios';
import { t } from 'i18next';

interface ApiErrorResponse {
  errorCode?: string;
  message?: string;
}

function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as AxiosError).response === 'object'
  );
}

/**
 * Translates a message code to the user's language
 * Falls back to the original message if translation is not found
 *
 * @param messageCode - The message code from the API (e.g., 'AUTH_EMAIL_VERIFICATION_COMPLETED')
 * @param fallbackMessage - The original message to use as fallback
 * @param params - Optional parameters for interpolation (e.g., { count: 3 })
 * @returns Translated message
 */
export function translateMessage(
  messageCode: string | undefined,
  fallbackMessage: string,
  params?: Record<string, string | number>
): string {
  if (!messageCode) {
    return fallbackMessage;
  }

  // Try to translate from messages or errors namespace
  const messageKey = `messages.${messageCode}`;
  const errorKey = `errors.${messageCode}`;

  // Check if it's a validation message (VALIDATION_XXX:field:value format)
  if (messageCode.startsWith('VALIDATION_')) {
    return translateValidationMessage(messageCode);
  }

  // Try messages namespace first, then errors
  let translated = t(messageKey, { ...params, defaultValue: '' });
  if (!translated) {
    translated = t(errorKey, { ...params, defaultValue: '' });
  }

  return translated || fallbackMessage;
}

/**
 * Translates validation messages with field names
 * Format: VALIDATION_CODE:fieldName:value (e.g., VALIDATION_MIN:page:1)
 */
function translateValidationMessage(messageCode: string): string {
  const parts = messageCode.split(':');
  const code = parts[0];
  const field = parts[1] || '';
  const value = parts[2] || '';

  const fieldName = t(`fields.${field}`, { defaultValue: field });

  const params: Record<string, string | number> = { field: fieldName };
  if (value) {
    if (code === 'VALIDATION_MIN') params.min = value;
    else if (code === 'VALIDATION_MAX') params.max = value;
    else if (code === 'VALIDATION_MAX_LENGTH') params.max = value;
    else if (code === 'VALIDATION_ARRAY_MIN') params.min = value;
    else if (code === 'VALIDATION_ARRAY_MAX') params.max = value;
  }

  return t(`validation.${code}`, { ...params, defaultValue: messageCode });
}

/**
 * Helper to get error message from API response
 */
export function getApiErrorMessage(
  error: unknown,
  defaultMessage?: string
): string {
  if (isAxiosError(error)) {
    const errorData = error.response?.data;

    if (errorData?.errorCode) {
      return translateMessage(
        errorData.errorCode,
        errorData.message || defaultMessage || t('errors.INTERNAL_SERVER_ERROR')
      );
    }

    return errorData?.message || defaultMessage || t('errors.INTERNAL_SERVER_ERROR');
  }

  return defaultMessage || t('errors.INTERNAL_SERVER_ERROR');
}

/**
 * Helper to get success message from API response
 */
export function getApiSuccessMessage(
  response: { message?: string; messageCode?: string },
  params?: Record<string, string | number>
): string {
  return translateMessage(
    response.messageCode,
    response.message || '',
    params
  );
}
