import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BattleHUD from '../BattleHUD';

describe('BattleHUD', () => {
    it('renderiza o título da arena e o botão de seleção', () => {
        render(<BattleHUD />);
        expect(screen.getByText(/Arena de Batalha Pokémon/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /selecionar pokémons/i })).toBeInTheDocument();
    });
}); 