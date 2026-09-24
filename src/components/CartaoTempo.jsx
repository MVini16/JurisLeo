// tempo em lisboa (ipma) no dashboard: avisos de mau tempo, hoje em grande e os dias seguintes
// se um pedido falha, mostra o que tinha guardado com o erro por cima e um botão "explicar"
import { useState } from 'react';
import { useTempo } from '../hooks/useTempo.js';
import { separarDias, iconeTempo, textoAtualizado } from '../services/apis/ipma.js';
import { mensagemDeErro } from '../data/errosApi.js';
import { FONTE_IPMA, NOMES_NIVEL } from '../data/ipma.js';
import './CartaoTempo.css';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// 'aaaa-mm-dd' → 'Sex', em hora local
function diaDaSemana(chave) {
  const [ano, mes, dia] = chave.split('-').map(Number);
  return DIAS_SEMANA[new Date(ano, mes - 1, dia).getDay()];
}

function graus(valor) {
  return valor === null ? '–' : `${Math.round(valor)}°`;
}

function hora(ms) {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// "Até às 21:00" se acaba hoje, senão "Até 25/09 às 06:00"
function textoFim(fim, agora) {
  const d = new Date(fim);
  if (d.toDateString() === new Date(agora).toDateString()) return `Até às ${hora(fim)}`;
  return `Até ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} às ${hora(fim)}`;
}

// ícones em traço, com a cor do texto à volta (currentColor)
function IconeTempo({ tipo, tamanho = 24 }) {
  const nome = iconeTempo(tipo);
  const sol = <><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>;
  const nuvem = <path d="M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 11a3.5 3.5 0 0 0 0 7z" />;
  const nuvemAlta = <path d="M7 15h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 8a3.5 3.5 0 0 0 0 7z" />;
  const desenhos = {
    sol,
    solNuvem: <><circle cx="8" cy="8" r="3" /><path d="M8 2v1.5M2 8h1.5M3.8 3.8l1 1M12.2 3.8l-1 1" /><path d="M9 19h9a3.5 3.5 0 0 0 .4-6.97A4.8 4.8 0 0 0 9 12.5a3.2 3.2 0 0 0 0 6.5z" /></>,
    nuvem,
    chuva: <>{nuvemAlta}<path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" /></>,
    trovoada: <>{nuvemAlta}<path d="M13 16l-2 3h3l-2 3" /></>,
    nevoeiro: <path d="M4 9h16M3 13h18M5 17h14" />,
  };
  return (
    <svg className="tempo-icone" width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {desenhos[nome]}
    </svg>
  );
}

function CartaoAviso({ aviso, agora }) {
  const nivel = (NOMES_NIVEL[aviso.nivel] ?? '').toLowerCase();
  return (
    <div className={`card tempo-aviso tempo-aviso--${aviso.nivel} anim-entrada`} style={{ '--delay': '0.12s' }}>
      <span className="tempo-aviso__icone">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4" /><path d="M12 17.5v.01" />
        </svg>
      </span>
      <span className="tempo-aviso__corpo">
        <strong>Aviso {nivel} de {aviso.tipo.toLowerCase()}</strong>
        {aviso.texto && <span>{aviso.texto}</span>}
        <span className="tempo-aviso__fim">{textoFim(aviso.fim, agora)}</span>
      </span>
    </div>
  );
}

function CaixaErro({ erro, tentarDepois }) {
  const [aberta, setAberta] = useState(false);
  const mensagem = mensagemDeErro(erro, tentarDepois);
  return (
    <div className="tempo-erro">
      <strong className="tempo-erro__titulo">{mensagem.titulo}</strong>
      <span className="tempo-erro__texto">{mensagem.texto}</span>
      <button type="button" className="tempo-erro__botao" onClick={() => setAberta((a) => !a)} aria-expanded={aberta}>
        {aberta ? 'Fechar' : 'Explicar'}
      </button>
      {aberta && <p className="tempo-erro__explicacao">{mensagem.explicacao}</p>}
    </div>
  );
}

export default function CartaoTempo() {
  const { previsao, avisos, guardadoEm, erro, tentarDepois, aCarregar, agora } = useTempo();

  // primeira abertura, ainda sem nada guardado: um esqueleto calmo em vez de números a saltar
  if (aCarregar && !previsao) {
    return (
      <div className="card card-tempo anim-entrada" style={{ '--delay': '0.15s' }} aria-busy="true">
        <div className="card-header"><span className="card-titulo">Tempo em Lisboa</span></div>
        <div className="tempo-esqueleto" />
      </div>
    );
  }

  const { principal, eHoje, seguintes } = separarDias(previsao, new Date(agora));
  const atualizado = textoAtualizado(guardadoEm, agora);

  return (
    <>
      {avisos.map((aviso) => (
        <CartaoAviso key={`${aviso.nivel}-${aviso.tipo}-${aviso.inicio}`} aviso={aviso} agora={agora} />
      ))}

      <div className="card card-tempo anim-entrada" style={{ '--delay': '0.15s' }}>
        <div className="card-header">
          <span className="card-titulo">Tempo em Lisboa</span>
          {atualizado && <span className="tempo-atualizado">{atualizado}</span>}
        </div>

        {erro && <CaixaErro erro={erro} tentarDepois={tentarDepois} />}

        {principal && (
          <div className={`tempo-hoje ${erro ? 'tempo-hoje--antigo' : ''}`}>
            <IconeTempo tipo={principal.tipo} tamanho={48} />
            <div className="tempo-hoje__texto">
              {!eHoje && <span className="tempo-hoje__dia">{diaDaSemana(principal.data)}</span>}
              <span className="tempo-hoje__graus">
                {graus(principal.max)}<span className="tempo-hoje__min"> / {graus(principal.min)}</span>
              </span>
              <span className="tempo-hoje__descricao">
                {principal.descricao ?? 'Sem descrição'}
                {principal.chuva !== null && ` · chuva ${Math.round(principal.chuva)}%`}
              </span>
            </div>
          </div>
        )}

        {!erro && seguintes.length > 0 && (
          <div className="tempo-semana">
            {seguintes.map((dia) => (
              <div key={dia.data} className="tempo-semana__dia">
                <span className="tempo-semana__nome">{diaDaSemana(dia.data)}</span>
                <IconeTempo tipo={dia.tipo} tamanho={22} />
                <span>{graus(dia.max)} <span className="tempo-semana__min">{graus(dia.min)}</span></span>
              </div>
            ))}
          </div>
        )}

        {!principal && !erro && <p className="tempo-vazio">Ainda não há previsão para hoje.</p>}

        <span className="tempo-fonte">{FONTE_IPMA}</span>
      </div>
    </>
  );
}
