class CalculadoraAcademica:
    """
    Métodos Estáticos (@staticmethod):
    Eles pertencem à classe, e não a um objeto criado (instância).
    Usamos muito quando a classe funciona apenas como um "pacote de ferramentas",
    que recebe valores como 5 e 8 e devolve o resultado, sem precisar guardar
    nada dentro de si (\`self\`).
    """
    
    @staticmethod
    def calcular_media_vas(va1: float, va2: float, va3: float) -> float:
        """Calcula a média aritmética simples das 3 VAs."""
        return (va1 + va2 + va3) / 3

    @staticmethod
    def verificar_aprovacao(media: float, frequencia: float) -> str:
        """Regras de negócio de aprovação num lugar só"""
        if frequencia < 75.0:
            return "Reprovado por Falta (RF)"
        elif media >= 7.0: # Considerando 7.0 a média de aprovação direta
            return "Aprovado"
        elif media >= 4.0: # Pode ir pra final/exame se for entre 4 e 7, por exemplo
            return "Em Exame Final"
        else:
            return "Reprovado por Nota"
