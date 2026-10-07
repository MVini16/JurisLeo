// sem nada visível: só liga o guardião dos dados (useGuardarConta) uma vez, para a app inteira
import { useGuardarConta } from '../hooks/useGuardarConta.js';

export default function GuardarConta() {
  useGuardarConta();
  return null;
}
