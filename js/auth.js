// Arquivo de autenticação e gerenciamento de usuários

// URL da API (Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbwPJk8gyC3WNXfU8k7XiPqsZ6cEJlpuY7vnTsRkttDTkwGO9UsetmmQ5tISQyLUkhNlrA/exec";

// Configurar eventos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function( ) {
    console.log("DOM carregado");
    
    // Encontrar todos os formulários na página
    const forms = document.querySelectorAll('form');
    console.log("Formulários encontrados:", forms.length);
    
    // Adicionar evento de submit a todos os formulários
    forms.forEach(function(form, index) {
        console.log("Formulário", index, ":", form);
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Formulário enviado:", index);
            
            // Verificar se é o formulário de login ou cadastro
            const isLoginForm = form.querySelector('input[type="password"]') && form.querySelectorAll('input').length <= 3;
            
            if (isLoginForm) {
                // É o formulário de login
                console.log("Processando formulário de login");
                
                // Encontrar campos de CPF e senha
                const inputs = form.querySelectorAll('input');
                let cpfInput = null;
                let passwordInput = null;
                
                inputs.forEach(function(input) {
                    if (input.type === 'password') {
                        passwordInput = input;
                    } else if (input.type === 'text' || input.type === 'tel') {
                        cpfInput = input;
                    }
                });
                
                if (!cpfInput || !passwordInput) {
                    console.error("Campos de CPF ou senha não encontrados");
                    alert("Erro ao processar o formulário. Verifique o console para mais detalhes.");
                    return;
                }
                
                const cpf = cpfInput.value.replace(/\D/g, '');
                const password = passwordInput.value;
                
                console.log("CPF:", cpf);
                console.log("Senha:", password);
                
                // Validar campos
                if (!cpf || !password) {
                    alert('Por favor, preencha todos os campos.');
                    return;
                }
                
                // Mostrar loading
                const submitButton = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
                if (submitButton) {
                    const originalText = submitButton.innerHTML || submitButton.value;
                    if (submitButton.tagName === 'INPUT') {
                        submitButton.value = "Entrando...";
                    } else {
                        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
                    }
                    submitButton.disabled = true;
                    
                    // Restaurar botão em caso de erro
                    const restoreButton = function() {
                        if (submitButton.tagName === 'INPUT') {
                            submitButton.value = originalText;
                        } else {
                            submitButton.innerHTML = originalText;
                        }
                        submitButton.disabled = false;
                    };
                    
                    // Fazer login
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', API_URL, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                if (response.success) {
                                    // Salvar dados do usuário e token
                                    localStorage.setItem('userData', JSON.stringify(response.user));
                                    localStorage.setItem('token', response.token);
                                    
                                    // Redirecionar para a página correta
                                    switch (response.user.tipo) {
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
                                    alert(response.message || 'Erro ao fazer login. Tente novamente.');
                                    restoreButton();
                                }
                            } catch (error) {
                                console.error('Erro ao processar resposta:', error);
                                alert('Erro ao processar resposta. Tente novamente mais tarde.');
                                restoreButton();
                            }
                        } else {
                            console.error('Erro na requisição:', xhr.status);
                            alert('Erro de conexão. Tente novamente mais tarde.');
                            restoreButton();
                        }
                    };
                    
                    xhr.onerror = function() {
                        console.error('Erro de conexão');
                        alert('Erro de conexão. Tente novamente mais tarde.');
                        restoreButton();
                    };
                    
                    xhr.send(JSON.stringify({
                        action: 'login',
                        cpf: cpf,
                        password: password
                    }));
                } else {
                    console.error("Botão de submit não encontrado");
                    alert("Erro ao processar o formulário. Verifique o console para mais detalhes.");
                }
            } else {
                // É o formulário de cadastro
                console.log("Processando formulário de cadastro");
                
                // Encontrar campos do formulário
                const inputs = form.querySelectorAll('input');
                let nameInput = null;
                let cpfInput = null;
                let phoneInput = null;
                let emailInput = null;
                let passwordInput = null;
                let confirmPasswordInput = null;
                
                inputs.forEach(function(input) {
                    if (input.type === 'password') {
                        if (!passwordInput) {
                            passwordInput = input;
                        } else {
                            confirmPasswordInput = input;
                        }
                    } else if (input.type === 'email' || input.name === 'email') {
                        emailInput = input;
                    } else if (input.type === 'tel' || input.name === 'telefone' || input.name === 'phone') {
                        phoneInput = input;
                    } else if (input.name === 'cpf') {
                        cpfInput = input;
                    } else if (input.name === 'nome' || input.name === 'name') {
                        nameInput = input;
                    }
                });
                
                if (!nameInput || !cpfInput || !phoneInput || !passwordInput || !confirmPasswordInput) {
                    console.error("Campos do formulário não encontrados");
                    console.log("nameInput:", nameInput);
                    console.log("cpfInput:", cpfInput);
                    console.log("phoneInput:", phoneInput);
                    console.log("emailInput:", emailInput);
                    console.log("passwordInput:", passwordInput);
                    console.log("confirmPasswordInput:", confirmPasswordInput);
                    alert("Erro ao processar o formulário. Verifique o console para mais detalhes.");
                    return;
                }
                
                const name = nameInput.value;
                const cpf = cpfInput.value.replace(/\D/g, '');
                const phone = phoneInput.value;
                const email = emailInput ? emailInput.value : '';
                const password = passwordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                console.log("Nome:", name);
                console.log("CPF:", cpf);
                console.log("Telefone:", phone);
                console.log("Email:", email);
                
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
                const submitButton = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
                if (submitButton) {
                    const originalText = submitButton.innerHTML || submitButton.value;
                    if (submitButton.tagName === 'INPUT') {
                        submitButton.value = "Cadastrando...";
                    } else {
                        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cadastrando...';
                    }
                    submitButton.disabled = true;
                    
                    // Restaurar botão em caso de erro
                    const restoreButton = function() {
                        if (submitButton.tagName === 'INPUT') {
                            submitButton.value = originalText;
                        } else {
                            submitButton.innerHTML = originalText;
                        }
                        submitButton.disabled = false;
                    };
                    
                    // Fazer cadastro
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', API_URL, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                if (response.success) {
                                    alert('Cadastro realizado com sucesso! Faça login para continuar.');
                                    
                                    // Mostrar formulário de login
                                    const loginContainer = document.getElementById('loginContainer');
                                    const registerContainer = document.getElementById('registerContainer');
                                    
                                    if (loginContainer && registerContainer) {
                                        registerContainer.classList.add('d-none');
                                        loginContainer.classList.remove('d-none');
                                    }
                                    
                                    // Limpar formulário
                                    form.reset();
                                } else {
                                    alert(response.message || 'Erro ao fazer cadastro. Tente novamente.');
                                    restoreButton();
                                }
                            } catch (error) {
                                console.error('Erro ao processar resposta:', error);
                                alert('Erro ao processar resposta. Tente novamente mais tarde.');
                                restoreButton();
                            }
                        } else {
                            console.error('Erro na requisição:', xhr.status);
                            alert('Erro de conexão. Tente novamente mais tarde.');
                            restoreButton();
                        }
                    };
                    
                    xhr.onerror = function() {
                        console.error('Erro de conexão');
                        alert('Erro de conexão. Tente novamente mais tarde.');
                        restoreButton();
                    };
                    
                    xhr.send(JSON.stringify({
                        action: 'register',
                        name: name,
                        cpf: cpf,
                        phone: phone,
                        email: email,
                        password: password,
                        tipo: 'responsavel' // Por padrão, novos usuários são responsáveis
                    }));
                } else {
                    console.error("Botão de submit não encontrado");
                    alert("Erro ao processar o formulário. Verifique o console para mais detalhes.");
                }
            }
        });
    });
    
    // Configurar botões de alternância entre login e cadastro
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function() {
            const loginContainer = document.getElementById('loginContainer');
            const registerContainer = document.getElementById('registerContainer');
            
            if (loginContainer && registerContainer) {
                loginContainer.classList.add('d-none');
                registerContainer.classList.remove('d-none');
            }
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function() {
            const loginContainer = document.getElementById('loginContainer');
            const registerContainer = document.getElementById('registerContainer');
            
            if (loginContainer && registerContainer) {
                registerContainer.classList.add('d-none');
                loginContainer.classList.remove('d-none');
            }
        });
    }
    
    // Verificar se o usuário está autenticado
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
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
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
        }
    }
    
    // Configurar botão de logout em outras páginas
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            window.location.href = window.location.href.includes('/pages/') ? '../index.html' : 'index.html';
        });
    }
});
