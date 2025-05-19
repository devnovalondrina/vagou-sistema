// Arquivo de autenticação e gerenciamento de usuários

// URL da API (Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbwPJk8gyC3WNXfU8k7XiPqsZ6cEJlpuY7vnTsRkttDTkwGO9UsetmmQ5tISQyLUkhNlrA/exec";

// Objeto para gerenciar autenticação
const auth = {
    // Verificar se o usuário está autenticado
    checkAuth: function( ) {
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
            // Se não estiver na página de login, redirecionar
            if (!window.location.href.includes('index.html') && !window.location.href.endsWith('/')) {
                window.location.href = '../index.html';
            }
            return null;
        }
        
        try {
            // Verificar se os dados são válidos
            const user = JSON.parse(userData);
            
            // Verificar tipo de usuário e redirecionar para a página correta se necessário
            const currentPage = window.location.pathname.split('/').pop();
            
            if (currentPage === 'index.html' || window.location.pathname.endsWith('/')) {
                // Redirecionar para a página correta com base no tipo de usuário
                switch (user.tipo) {
                    case 'admin':
                        window.location.href = 'pages/admin.html';
                        break;
                    case 'gestor':
                        window.location.href = 'pages/gestor.html';
                        break;
                    case 'responsavel':
                        window.location.href = 'pages/responsavel.html';
                        break;
                }
                return null;
            } else {
                // Verificar se o usuário está na página correta
                const isAdminPage = currentPage === 'admin.html';
                const isGestorPage = currentPage === 'gestor.html';
                const isResponsavelPage = currentPage === 'responsavel.html';
                
                if ((isAdminPage && user.tipo !== 'admin') ||
                    (isGestorPage && user.tipo !== 'gestor') ||
                    (isResponsavelPage && user.tipo !== 'responsavel')) {
                    // Redirecionar para a página correta
                    switch (user.tipo) {
                        case 'admin':
                            window.location.href = 'admin.html';
                            break;
                        case 'gestor':
                            window.location.href = 'gestor.html';
                            break;
                        case 'responsavel':
                            window.location.href = 'responsavel.html';
                            break;
                    }
                    return null;
                }
            }
            
            return user;
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            this.logout();
            return null;
        }
    },
    
    // Obter token de autenticação
    getAuthToken: function() {
        return localStorage.getItem('token');
    },
    
    // Fazer logout
    logout: function() {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = window.location.href.includes('/pages/') ? '../index.html' : 'index.html';
    }
};

// Configurar eventos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de login
    const isLoginPage = window.location.href.includes('index.html') || window.location.pathname.endsWith('/');
    
    if (isLoginPage) {
        // Configurar formulário de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Configurar formulário de cadastro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        // Configurar botões de alternância entre login e cadastro
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const showLoginBtn = document.getElementById('showLoginBtn');
        
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', function() {
                document.getElementById('loginContainer').classList.add('d-none');
                document.getElementById('registerContainer').classList.remove('d-none');
            });
        }
        
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', function() {
                document.getElementById('registerContainer').classList.add('d-none');
                document.getElementById('loginContainer').classList.remove('d-none');
            });
        }
    } else {
        // Configurar botão de logout em outras páginas
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                auth.logout();
            });
        }
        
        // Verificar autenticação
        const userData = auth.checkAuth();
        if (!userData) return;
    }
});

// Função para lidar com o login
async function handleLogin(e) {
    e.preventDefault();
    
    // Obter elementos do formulário
    const cpfInput = document.getElementById('loginCpf');
    const passwordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    
    // Verificar se os elementos existem
    if (!cpfInput || !passwordInput || !loginBtn) {
        console.error('Elementos do formulário de login não encontrados');
        alert('Erro ao processar o formulário. Por favor, recarregue a página.');
        return;
    }
    
    // Obter dados do formulário
    const cpf = cpfInput.value.replace(/\D/g, '');
    const password = passwordInput.value;
    
    // Validar campos
    if (!cpf || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Mostrar loading
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
    loginBtn.disabled = true;
    
    try {
        // Preparar dados para envio
        const data = {
            action: 'login',
            cpf: cpf,
            password: password
        };
        
        // Fazer requisição para a API usando iframe
        postViaIframe(API_URL, data, function(result) {
            if (result.success) {
                // Salvar dados do usuário e token
                localStorage.setItem('userData', JSON.stringify(result.user));
                localStorage.setItem('token', result.token);
                
                // Redirecionar para a página correta
                switch (result.user.tipo) {
                    case 'admin':
                        window.location.href = 'pages/admin.html';
                        break;
                    case 'gestor':
                        window.location.href = 'pages/gestor.html';
                        break;
                    case 'responsavel':
                        window.location.href = 'pages/responsavel.html';
                        break;
                    default:
                        window.location.href = 'pages/responsavel.html';
                }
            } else {
                alert(result.message || 'Erro ao fazer login. Tente novamente.');
                
                // Restaurar botão
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro de conexão. Tente novamente mais tarde.');
        
        // Restaurar botão
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

// Função para lidar com o cadastro
async function handleRegister(e) {
    e.preventDefault();
    
    // Obter elementos do formulário
    const nameInput = document.getElementById('registerName');
    const cpfInput = document.getElementById('registerCpf');
    const phoneInput = document.getElementById('registerPhone');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');
    const registerBtn = document.getElementById('registerBtn');
    
    // Verificar se os elementos existem
    if (!nameInput || !cpfInput || !phoneInput || !passwordInput || !confirmPasswordInput || !registerBtn) {
        console.error('Elementos do formulário de cadastro não encontrados');
        alert('Erro ao processar o formulário. Por favor, recarregue a página.');
        return;
    }
    
    // Obter dados do formulário
    const name = nameInput.value;
    const cpf = cpfInput.value.replace(/\D/g, '');
    const phone = phoneInput.value;
    const email = emailInput ? emailInput.value : '';
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validar campos
    if (!name || !cpf || !phone || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
    }
    
    // Mostrar loading
    const originalText = registerBtn.innerHTML;
    registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cadastrando...';
    registerBtn.disabled = true;
    
    try {
        // Preparar dados para envio
        const data = {
            action: 'register',
            name: name,
            cpf: cpf,
            phone: phone,
            email: email,
            password: password,
            tipo: 'responsavel' // Por padrão, novos usuários são responsáveis
        };
        
        // Fazer requisição para a API usando iframe
        postViaIframe(API_URL, data, function(result) {
            if (result.success) {
                alert('Cadastro realizado com sucesso! Faça login para continuar.');
                
                // Mostrar formulário de login
                const loginContainer = document.getElementById('loginContainer');
                const registerContainer = document.getElementById('registerContainer');
                
                if (loginContainer && registerContainer) {
                    registerContainer.classList.add('d-none');
                    loginContainer.classList.remove('d-none');
                }
                
                // Limpar formulário
                const registerForm = document.getElementById('registerForm');
                if (registerForm) {
                    registerForm.reset();
                }
            } else {
                alert(result.message || 'Erro ao fazer cadastro. Tente novamente.');
            }
            
            // Restaurar botão
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
        });
    } catch (error) {
        console.error('Erro ao fazer cadastro:', error);
        alert('Erro de conexão. Tente novamente mais tarde.');
        
        // Restaurar botão
        registerBtn.innerHTML = originalText;
        registerBtn.disabled = false;
    }
}

// Função para fazer requisições JSONP (apenas GET)
function jsonpRequest(url, params, callback) {
    // Criar elemento script
    const script = document.createElement('script');
    
    // Adicionar callback como parâmetro
    params.callback = 'jsonpCallback_' + Math.floor(Math.random() * 1000000);
    
    // Definir callback global
    window[params.callback] = function(data) {
        callback(data);
        document.body.removeChild(script);
        delete window[params.callback];
    };
    
    // Construir URL com parâmetros
    const queryString = Object.keys(params)
        .map(key => key + '=' + encodeURIComponent(params[key]))
        .join('&');
    
    // Definir src e adicionar ao documento
    script.src = url + '?' + queryString;
    document.body.appendChild(script);
}

// Função para fazer requisições POST via iframe
function postViaIframe(url, data, callback) {
    // Criar um ID único para o iframe
    const iframeId = 'iframe_' + Math.floor(Math.random() * 1000000);
    const formId = 'form_' + Math.floor(Math.random() * 1000000);
    
    // Criar iframe
    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.name = iframeId;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Criar formulário
    const form = document.createElement('form');
    form.id = formId;
    form.method = 'POST';
    form.action = url;
    form.target = iframeId;
    form.style.display = 'none';
    
    // Adicionar campo para os dados
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(data);
    form.appendChild(input);
    
    document.body.appendChild(form);
    
    // Configurar evento de carregamento do iframe
    iframe.onload = function() {
        try {
            // Tentar obter resposta do iframe
            const iframeContent = iframe.contentWindow.document.body.innerText;
            const response = JSON.parse(iframeContent);
            callback(response);
        } catch (error) {
            console.error('Erro ao processar resposta:', error);
            callback({ success: false, message: 'Erro de comunicação' });
        }
        
        // Limpar
        document.body.removeChild(form);
        document.body.removeChild(iframe);
    };
    
    // Enviar formulário
    form.submit();
}
