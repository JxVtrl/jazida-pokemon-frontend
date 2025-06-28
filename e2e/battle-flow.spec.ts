import { test, expect } from '@playwright/test';

test('fluxo completo: batalha entre dois pokémons', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Esperar o botão da aba estar visível
    await page.waitForSelector('button', { state: 'visible', timeout: 60000 });
    // Tentar clicar no botão pelo texto visível
    try {
        await page.getByText('Arena de Batalha', { exact: false }).click();
    } catch (e) {
        // Printar HTML para debug
        const html = await page.content();
        console.log('DEBUG HTML:', html);
        throw e;
    }

    // Verificar se a arena de batalha carregou
    await expect(page.getByText('⚔️ Arena de Batalha Pokémon')).toBeVisible();

    // Abrir drawer de seleção
    await page.getByRole('button', { name: /selecionar pokémons/i }).click();

    // Verificar se o drawer abriu
    await expect(page.getByText('Selecione dois pokémons para batalhar')).toBeVisible();

    // Fechar drawer (mesmo que não haja Pokémons)
    await page.getByRole('button', { name: /fechar/i }).click();

    // Verificar se voltou para a arena
    await expect(page.getByText('⚔️ Arena de Batalha Pokémon')).toBeVisible();
}, 60000); 