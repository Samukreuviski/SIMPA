class Avaliacao:
    """
    Esta classe vai conter os dados das notas do aluno em uma disciplina.
    O boletim será composto por esses objetos.
    """
    def __init__(self, disciplina: str):
        self.disciplina = disciplina
        self.va1 = 0.0
        self.va2 = 0.0
        self.va3 = 0.0

    def lancar_notas(self, va1: float = None, va2: float = None, va3: float = None):
        """Atualiza as notas passadas. Se alguma não for passada, ela permanece como estava."""
        if va1 is not None:
            self.va1 = va1
        if va2 is not None:
            self.va2 = va2
        if va3 is not None:
            self.va3 = va3
        return f"Notas da disciplina {self.disciplina} atualizadas."

    def listar_notas(self):
        return f"{self.disciplina} -> VA1: {self.va1} | VA2: {self.va2} | VA3: {self.va3}"
