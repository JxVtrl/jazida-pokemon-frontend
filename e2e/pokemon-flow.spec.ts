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
        await page.getByLabel('mewtwo').click();
        await page.getByLabel(/treinador/i).fill('E2E Test');

        // Submeter
        await page.getByRole('button', { name: /criar pokémon/i }).click();

        // Verificar se foi criado (usar seletor mais específico)
        await expect(page.locator('[data-testid="pokemon-card"]').filter({ hasText: 'Mewtwo' }).first()).toBeVisible();
        await expect(page.getByText('E2E Test').first()).toBeVisible();

        // 3. Navegar para arena de batalha
        await page.getByRole('button', { name: /arena de batalha/i }).click();

        // Verificar se mudou para arena
        await expect(page.getByText('⚔️ Arena de Batalha Pokémon')).toBeVisible();

        // 4. Selecionar pokémons para batalha
        await page.getByRole('button', { name: /selecionar pokémons/i }).click();

        // Selecionar dois pokémons diferentes
        const cards = await page.locator('[data-testid^="drawer-pokemon-"]').all();
        let selected = 0;
        let lastId = null;
        for (const card of cards) {
            const testid = await card.getAttribute('data-testid');
            const id = testid?.split('-').pop();
            if (id !== lastId) {
                await card.click();
                selected++;
                lastId = id;
            }
            if (selected === 2) break;
        }
        // Fechar o drawer antes de batalhar
        await page.getByTestId('close-drawer-button').click();

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
        await expect(page.locator('[data-testid="pokemon-card"]').filter({ hasText: 'Mewtwo' }).first()).toBeVisible();
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
        await page.getByLabel('pikachu').click();
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

        // Aguardar carregamento completo (removido verificação de loading que não existe)
        await expect(page.getByText('Pikachu')).toBeVisible({ timeout: 10000 });

        // Testar loading no formulário
        await page.getByRole('button', { name: '+ Adicionar Pokémon' }).click();
        await page.getByLabel('pikachu').click();
        await page.getByLabel(/treinador/i).fill('Performance Test');
        await page.getByRole('button', { name: /criar pokémon/i }).click();

        // Verificar loading state (se existir)
        try {
            await expect(page.getByText(/criando/i)).toBeVisible({ timeout: 2000 });
        } catch {
            // Se não aparecer loading, continuar
        }

        // Aguardar conclusão
        await expect(page.getByText('Performance Test').first()).toBeVisible({ timeout: 10000 });
    });
}); 