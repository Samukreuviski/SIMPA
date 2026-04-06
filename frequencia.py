class Frequencia:
    """
    Controla faltas e presenças.
    O boletim também será composto por esses objetos.
    """
    def __init__(self, disciplina: str, total_aulas_semestre: int = 60):
        self.disciplina = disciplina
        self.total_aulas_semestre = total_aulas_semestre
        self.faltas = 0
        
    def registrar_falta(self, quantidade: int = 1):
        self.faltas += quantidade
        return f"{quantidade} falta(s) registrada(s) na disciplina de {self.disciplina}."

    def situacao_frequencia(self):
        """Retorna a porcentagem de comparecimento."""
        if self.total_aulas_semestre == 0:
            return 0
        presencas = self.total_aulas_semestre - self.faltas
        porcentagem = (presencas / self.total_aulas_semestre) * 100
        return porcentagem
