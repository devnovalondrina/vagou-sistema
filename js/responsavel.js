// Arquivo JavaScript para o painel do responsável

// Variáveis globais
let userData = null;
let cmeisList = [];

// Inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    userData = auth.checkAuth();
    if (!userData) return;
    
    // Verificar se é um responsável
    if (userData.tipo !== 'responsavel') {
        alert('Acesso não autorizado. Você será redirecionado.');
        auth.logout();
        return;
    }
    
    // Exibir nome do usuário
    document.getElementById('userNameDisplay').textContent = userData.nome;
    
    // Configurar evento de logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        auth.logout();
    });
    
    // Configurar navegação
    setupNavigation();
    
    // Carregar lista de CMEIs
    loadCMEIs();
    
    // Carregar inscrições do responsável
    loadInscricoes();
});

// Configurar navegação entre seções
function setupNavigation() {
    // Botões do menu principal
    document.getElementById('novaInscricaoBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('novaInscricaoSection');
    });
    
    document.getElementById('minhasInscricoesBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('minhasInscricoesSection');
    });
    
    // Botões da seção de boas-vindas
    document.getElementById('welcomeNovaInscricaoBtn').addEventListener('click', function() {
        showSection('novaInscricaoSection');
    });
    
    document.getElementById('welcomeMinhasInscricoesBtn').addEventListener('click', function() {
        showSection('minhasInscricoesSection');
    });
    
    // Botão para voltar à lista de inscrições
    document.getElementById('voltarListaBtn').addEventListener('click', function() {
        showSection('minhasInscricoesSection');
    });
    
    // Botão para nova inscrição na seção sem inscrições
    document.getElementById('semInscricoesNovaBtn').addEventListener('click', function() {
        showSection('novaInscricaoSection');
    });
    
    // Navegação entre etapas do formulário de inscrição
    document.getElementById('nextStep1').addEventListener('click', function() {
        if (validateStep1()) {
            document.getElementById('step1').classList.add('d-none');
            document.getElementById('step2').classList.remove('d-none');
        }
    });
    
    document.getElementById('prevStep2').addEventListener('click', function() {
        document.getElementById('step2').classList.add('d-none');
        document.getElementById('step1').classList.remove('d-none');
    });
    
    document.getElementById('nextStep2').addEventListener('click', function() {
        if (validateStep2()) {
            document.getElementById('step2').classList.add('d-none');
            document.getElementById('step3').classList.remove('d-none');
        }
    });
    
    document.getElementById('prevStep3').addEventListener('click', function() {
        document.getElementById('step3').classList.add('d-none');
        document.getElementById('step2').classList.remove('d-none');
    });
    
    // Botão para localizar no mapa
    document.getElementById('localizarBtn').addEventListener('click', function() {
        const endereco = document.getElementById('endereco').value;
        const cep = document.getElementById('cep').value;
        
        if (!endereco || !cep) {
            alert('Preencha o endereço e CEP para localizar no mapa.');
            return;
        }
        
        // Simulação de geolocalização
        document.getElementById('mapContainer').classList.remove('d-none');
        document.getElementById('geolocalizacao').value = '-25.123456,-49.123456'; // Valor simulado
    });
    
    // Formulário de inscrição
    document.getElementById('inscricaoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitInscricao();
    });
    
    // Evento de mudança no select de CMEI
    document.getElementById('cmeiSelect').addEventListener('change', function() {
        const cmeiId = this.value;
        if (cmeiId) {
            // Simulação de cálculo de distância
            const distancia = (Math.random() * 5).toFixed(2);
            document.getElementById('distanciaValor').textContent = distancia;
            document.getElementById('distanciaInfo').classList.remove('d-none');
        }
    });
}

// Função para mostrar uma seção e esconder as outras
function showSection(sectionId) {
    // Esconder todas as seções
    const sections = ['welcomeSection', 'novaInscricaoSection', 'minhasInscricoesSection', 'detalhesInscricaoSection'];
    sections.forEach(section => {
        document.getElementById(section).classList.add('d-none');
    });
    
    // Mostrar a seção selecionada
    document.getElementById(sectionId).classList.remove('d-none');
    
    // Se for a seção de nova inscrição, resetar o formulário
    if (sectionId === 'novaInscricaoSection') {
        resetInscricaoForm();
    }
    
    // Se for a seção de minhas inscrições, recarregar a lista
    if (sectionId === 'minhasInscricoesSection') {
        loadInscricoes();
    }
}

// Função para validar a primeira etapa do formulário
function validateStep1() {
    const nomeCrianca = document.getElementById('nomeCrianca').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const sexoM = document.getElementById('sexoM').checked;
    const sexoF = document.getElementById('sexoF').checked;
    
    if (!nomeCrianca) {
        alert('Preencha o nome da criança.');
        return false;
    }
    
    if (!dataNascimento) {
        alert('Selecione a data de nascimento.');
        return false;
    }
    
    if (!sexoM && !sexoF) {
        alert('Selecione o sexo da criança.');
        return false;
    }
    
    return true;
}

// Função para validar a segunda etapa do formulário
function validateStep2() {
    const endereco = document.getElementById('endereco').value;
    const cep = document.getElementById('cep').value;
    const geolocalizacao = document.getElementById('geolocalizacao').value;
    
    if (!endereco) {
        alert('Preencha o endereço completo.');
        return false;
    }
    
    if (!cep) {
        alert('Preencha o CEP.');
        return false;
    }
    
    if (!geolocalizacao) {
        alert('Clique em "Localizar no Mapa" para obter a geolocalização.');
        return false;
    }
    
    return true;
}

// Função para resetar o formulário de inscrição
function resetInscricaoForm() {
    document.getElementById('inscricaoForm').reset();
    document.getElementById('step1').classList.remove('d-none');
    document.getElementById('step2').classList.add('d-none');
    document.getElementById('step3').classList.add('d-none');
    document.getElementById('mapContainer').classList.add('d-none');
    document.getElementById('distanciaInfo').classList.add('d-none');
    document.getElementById('inscricaoError').classList.add('d-none');
}

// Função para carregar a lista de CMEIs
async function loadCMEIs() {
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Fazer requisição para a API
        const response = await fetch(`${API_URL}?action=listar_cmeis&token=${token}`);
        const data = await response.json();
        
        if (data.success) {
            cmeisList = data.cmeis;
            
            // Preencher o select de CMEIs
            const cmeiSelect = document.getElementById('cmeiSelect');
            cmeiSelect.innerHTML = '<option value="" selected disabled>Selecione um CMEI</option>';
            
            cmeisList.forEach(cmei => {
                const option = document.createElement('option');
                option.value = cmei.id;
                option.textContent = cmei.nome;
                cmeiSelect.appendChild(option);
            });
        } else {
            console.error('Erro ao carregar CMEIs:', data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar CMEIs:', error);
    }
}

// Função para carregar as inscrições do responsável
async function loadInscricoes() {
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Fazer requisição para a API
        const response = await fetch(`${API_URL}?action=listar_inscricoes&token=${token}`);
        const data = await response.json();
        
        if (data.success) {
            const inscricoes = data.inscricoes;
            const tableBody = document.getElementById('inscricoesTableBody');
            
            // Verificar se há inscrições
            if (inscricoes.length === 0) {
                document.getElementById('semInscricoes').classList.remove('d-none');
                tableBody.innerHTML = '';
            } else {
                document.getElementById('semInscricoes').classList.add('d-none');
                
                // Preencher a tabela com as inscrições
                tableBody.innerHTML = '';
                inscricoes.forEach(inscricao => {
                    const row = document.createElement('tr');
                    
                    // Formatar a data
                    const data = new Date(inscricao.data_inscricao);
                    const dataFormatada = data.toLocaleDateString('pt-BR');
                    
                    // Definir classe para o status
                    let statusClass = '';
                    switch (inscricao.status) {
                        case 'Aprovado':
                            statusClass = 'status-aprovado';
                            break;
                        case 'Reprovado':
                            statusClass = 'status-reprovado';
                            break;
                        default:
                            statusClass = 'status-aguardando';
                    }
                    
                    row.innerHTML = `
                        <td>${inscricao.crianca_nome}</td>
                        <td>${inscricao.cmei_nome}</td>
                        <td>${dataFormatada}</td>
                        <td><span class="status-badge ${statusClass}">${inscricao.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-details" data-id="${inscricao.id}">
                                <i class="fas fa-eye"></i> Detalhes
                            </button>
                        </td>
                    `;
                    
                    tableBody.appendChild(row);
                });
                
                // Adicionar evento aos botões de detalhes
                document.querySelectorAll('.view-details').forEach(button => {
                    button.addEventListener('click', function() {
                        const inscricaoId = this.getAttribute('data-id');
                        viewInscricaoDetails(inscricaoId);
                    });
                });
            }
        } else {
            console.error('Erro ao carregar inscrições:', data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar inscrições:', error);
    }
}

// Função para visualizar detalhes de uma inscrição
async function viewInscricaoDetails(inscricaoId) {
    try {
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Fazer requisição para a API
        const response = await fetch(`${API_URL}?action=detalhes_inscricao&id=${inscricaoId}&token=${token}`);
        const data = await response.json();
        
        if (data.success) {
            const detalhes = data;
            
            // Preencher os campos de detalhes
            document.getElementById('detNomeCrianca').textContent = detalhes.crianca.nome;
            
            // Formatar a data de nascimento
            const dataNasc = new Date(detalhes.crianca.data_nascimento);
            document.getElementById('detDataNascimento').textContent = dataNasc.toLocaleDateString('pt-BR');
            
            document.getElementById('detSexo').textContent = detalhes.crianca.sexo === 'M' ? 'Masculino' : 'Feminino';
            document.getElementById('detBolsaFamilia').textContent = detalhes.crianca.bolsa_familia === 'true' ? 'Sim' : 'Não';
            
            document.getElementById('detCmei').textContent = detalhes.cmei.nome;
            
            // Formatar a data de inscrição
            const dataInsc = new Date(detalhes.inscricao.data_inscricao);
            document.getElementById('detDataInscricao').textContent = dataInsc.toLocaleDateString('pt-BR');
            
            document.getElementById('detStatus').textContent = detalhes.inscricao.status;
            document.getElementById('detDistancia').textContent = detalhes.inscricao.distancia_km;
            
            // Observações
            document.getElementById('detObservacoes').textContent = detalhes.inscricao.observacoes || 'Sem observações.';
            
            // Mostrar a seção de detalhes
            showSection('detalhesInscricaoSection');
        } else {
            console.error('Erro ao carregar detalhes da inscrição:', data.message);
            alert('Erro ao carregar detalhes da inscrição. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes da inscrição:', error);
        alert('Erro ao carregar detalhes da inscrição. Tente novamente.');
    }
}

// Função para enviar o formulário de inscrição
async function submitInscricao() {
    try {
        // Obter dados do formulário
        const nomeCrianca = document.getElementById('nomeCrianca').value;
        const dataNascimento = document.getElementById('dataNascimento').value;
        const sexo = document.getElementById('sexoM').checked ? 'M' : 'F';
        const bolsaFamilia = document.getElementById('bolsaFamilia').checked;
        const observacoes = document.getElementById('observacoes').value;
        const geolocalizacao = document.getElementById('geolocalizacao').value;
        const cmeiId = document.getElementById('cmeiSelect').value;
        const observacoesCmei = document.getElementById('observacoesCmei').value;
        
        // Validar campos obrigatórios
        if (!nomeCrianca || !dataNascimento || !geolocalizacao || !cmeiId) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        
        // Obter o token de autenticação
        const token = auth.getAuthToken();
        
        // Preparar dados para envio
        const inscricaoData = {
            action: 'nova_inscricao',
            token: token,
            crianca: {
                nome: nomeCrianca,
                data_nascimento: dataNascimento,
                sexo: sexo,
                bolsa_familia: bolsaFamilia,
                observacoes: observacoes
            },
            geolocalizacao: geolocalizacao,
            cmei_id: cmeiId,
            observacoes: observacoesCmei
        };
        
        // Mostrar indicador de carregamento
        const submitButton = document.getElementById('submitInscricao');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Aguarde...';
        
        // Fazer requisição para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inscricaoData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Mostrar mensagem de sucesso
            alert('Inscrição realizada com sucesso!');
            
            // Resetar formulário e mostrar lista de inscrições
            resetInscricaoForm();
            showSection('minhasInscricoesSection');
        } else {
            // Mostrar mensagem de erro
            const errorElement = document.getElementById('inscricaoError');
            errorElement.textContent = data.message || 'Erro ao realizar inscrição.';
            errorElement.classList.remove('d-none');
            
            // Esconder a mensagem após 5 segundos
            setTimeout(() => {
                errorElement.classList.add('d-none');
            }, 5000);
        }
    } catch (error) {
        console.error('Erro ao realizar inscrição:', error);
        
        // Mostrar mensagem de erro
        const errorElement = document.getElementById('inscricaoError');
        errorElement.textContent = 'Erro de conexão. Tente novamente mais tarde.';
        errorElement.classList.remove('d-none');
        
        // Esconder a mensagem após 5 segundos
        setTimeout(() => {
            errorElement.classList.add('d-none');
        }, 5000);
    } finally {
        // Restaurar botão
        const submitButton = document.getElementById('submitInscricao');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-check-circle"></i> Finalizar Inscrição';
    }
}
