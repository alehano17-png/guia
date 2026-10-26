import type { TranslationDictionary } from "./i18n";

// Texto claro para un error de inicio de sesión o registro, según el
// `code` de Supabase (no el texto del mensaje, que viene en inglés y puede
// cambiar). Sin código conocido (por ejemplo, sin conexión), un mensaje
// genérico. Lo usan login y registro.
export function getAuthErrorMessage(
  code: string | null | undefined,
  t: TranslationDictionary
): string {
  const errors = t.auth.errors;

  switch (code) {
    case "invalid_credentials":
      return errors.invalidCredentials;
    case "email_not_confirmed":
      return errors.emailNotConfirmed;
    case "user_already_exists":
    case "email_exists":
      return errors.userAlreadyExists;
    case "weak_password":
      return errors.weakPassword;
    case "email_address_invalid":
    case "validation_failed":
      return errors.invalidEmail;
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return errors.tooManyAttempts;
    default:
      return errors.generic;
  }
}
