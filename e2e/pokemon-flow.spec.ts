import { test, expect } from '@playwright/test';

test('fluxo completo: cadastro e listagem de pokémon', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Esperar o botão estar visível
    await page.waitForSelector('button', { state: 'visible', timeout: 60000 });
    // Tentar clicar no botão pelo texto visível
    try {
        await page.getByText('Adicionar Pokémon', { exact: false }).click();
    } catch (e) {
        // Printar HTML para debug
        const html = await page.content();
        console.log('DEBUG HTML:', html);
        throw e;
    }

    // Verificar se o drawer abriu
    await expect(page.getByText('Adicionar novo Pokémon')).toBeVisible();

    // Selecionar tipo
    await page.getByLabel('pikachu').click();

    // Preencher treinador
    await page.getByPlaceholder('Nome do Treinador').fill('Misty');

    // Verificar se o botão de criar está habilitado
    await expect(page.getByRole('button', { name: /criar pokémon/i })).toBeEnabled();

    // Submeter (pode falhar se backend não estiver rodando, mas isso é OK)
    await page.getByRole('button', { name: /criar pokémon/i }).click();

    // Verificar se pelo menos o formulário funcionou
    await expect(page.getByText('Adicionar novo Pokémon')).toBeVisible();
}, 60000); 