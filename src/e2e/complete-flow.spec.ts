import { test, expect } from '@playwright/test';

test.describe('Fluxo completo da aplicação', () => {
    test('fluxo completo: cadastro, listagem e batalha', async ({ page }) => {
        // 1. Acessar a aplicação
        await page.goto('http://localhost:5173');

        // Verificar se carregou
        await expect(page.getByText('🎮 Jazida Pokémon Challenge')).toBeVisible();

        // 2. Cadastrar novo pokémon
        await page.getByRole('button', { name: '+ Adicionar Pokémon' }).click();

        // Preencher formulário
        await page.getByLabel('mewtwo').check();
        await page.getByLabel(/treinador/i).fill('E2E Test');

        // Submeter
        await page.getByRole('button', { name: /criar pokémon/i }).click();

        // Verificar se foi criado
        await expect(page.getByText('Mewtwo')).toBeVisible();
        await expect(page.getByText('E2E Test')).toBeVisible();

        // 3. Navegar para arena de batalha
        await page.getByRole('button', { name: /arena de batalha/i }).click();

        // Verificar se mudou para arena
        await expect(page.getByText('⚔️ Arena de Batalha Pokémon')).toBeVisible();

        // 4. Selecionar pokémons para batalha
        await page.getByRole('button', { name: /selecionar pokémons/i }).click();

        // Selecionar dois pokémons
        await page.getByText('Pikachu').first().click();
        await page.getByText('Charizard').first().click();

        // Verificar se aparecem na arena
        await expect(page.getByText('Pokémons para Batalha:')).toBeVisible();
        await expect(page.getByText('VS')).toBeVisible();

        // 5. Iniciar batalha
        await page.getByRole('button', { name: /⚔️ Batalhar!/i }).click();

        // Verificar animação de batalha
        await expect(page.getByText('Batalhando...')).toBeVisible();

        // Aguardar resultado
        await expect(page.getByText('🏆 Resultado da Batalha')).toBeVisible({ timeout: 10000 });

        // 6. Voltar para lista
        await page.getByRole('button', { name: /lista de pokémons/i }).click();

        // Verificar se voltou
        await expect(page.getByText('📋 Lista de Pokémons')).toBeVisible();

        // Verificar se pokémons ainda estão lá
        await expect(page.getByText('Mewtwo')).toBeVisible();
    });

    test('testa responsividade em mobile', async ({ page }) => {
        // Configurar viewport mobile
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('http://localhost:5173');

        // Verificar se elementos estão visíveis em mobile
        await expect(page.getByText('🎮 Jazida Pokémon Challenge')).toBeVisible();
        await expect(page.getByRole('button', { name: '+ Adicionar Pokémon' })).toBeVisible();

        // Testar navegação em mobile
        await page.getByRole('button', { name: /arena de batalha/i }).click();
        await expect(page.getByText('⚔️ Arena de Batalha Pokémon')).toBeVisible();

        // Voltar
        await page.getByRole('button', { name: /lista de pokémons/i }).click();
        await expect(page.getByText('📋 Lista de Pokémons')).toBeVisible();
    });

    test('testa tratamento de erros', async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Simular erro de rede (pode ser feito interceptando requests)
        await page.route('**/pokemons', route => route.abort());

        // Tentar cadastrar pokémon
        await page.getByRole('button', { name: '+ Adicionar Pokémon' }).click();
        await page.getByLabel('pikachu').check();
        await page.getByLabel(/treinador/i).fill('Error Test');
        await page.getByRole('button', { name: /criar pokémon/i }).click();

        // Verificar se erro aparece
        await expect(page.getByText(/erro/i)).toBeVisible();
    });

    test('testa validação de formulário', async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Abrir formulário
        await page.getByRole('button', { name: '+ Adicionar Pokémon' }).click();

        // Tentar submeter sem preencher
        await page.getByRole('button', { name: /criar pokémon/i }).click();

        // Verificar se formulário não foi submetido (não deve aparecer novo pokémon)
        const initialCount = await page.locator('[data-testid="pokemon-card"]').count();

        // Tentar novamente sem preencher
        await page.getByRole('button', { name: /criar pokémon/i }).click();

        const finalCount = await page.locator('[data-testid="pokemon-card"]').count();
        expect(finalCount).toBe(initialCount);
    });

    test('testa performance e loading states', async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Verificar se loading aparece inicialmente
        await expect(page.getByText(/carregando/i)).toBeVisible({ timeout: 5000 });

        // Aguardar carregamento completo
        await expect(page.getByText('Pikachu')).toBeVisible({ timeout: 10000 });

        // Testar loading no formulário
        await page.getByRole('button', { name: '+ Adicionar Pokémon' }).click();
        await page.getByLabel('pikachu').check();
        await page.getByLabel(/treinador/i).fill('Performance Test');
        await page.getByRole('button', { name: /criar pokémon/i }).click();

        // Verificar loading state
        await expect(page.getByText(/criando/i)).toBeVisible();

        // Aguardar conclusão
        await expect(page.getByText('Performance Test')).toBeVisible({ timeout: 10000 });
    });
}); 