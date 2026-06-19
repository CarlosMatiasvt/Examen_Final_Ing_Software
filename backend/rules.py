from sqlalchemy.orm import Session
from sqlalchemy import func
from .database import VentaControlada, EmpresaConfiguracion, Cliente
import datetime

def calculate_client_quota(db: Session, cliente_id: int):
    # 1. Obtener configuración global
    config = db.query(EmpresaConfiguracion).first()
    factor_holgura = config.factor_holgura if config else 10.0
    cupo_base_inicial = config.cupo_base_inicial if config else 50.0

    # 2. Calcular historial de los últimos 28 días
    fecha_limite = datetime.datetime.utcnow() - datetime.timedelta(days=28)
    
    suma_compras = db.query(func.sum(VentaControlada.cantidad_litros)).filter(
        VentaControlada.id_cliente == cliente_id,
        VentaControlada.fecha_hora >= fecha_limite
    ).scalar() or 0.0

    # 3. Calcular Promedio Semanal (Ps)
    promedio_semanal = suma_compras / 4.0

    # 4. Lógica de excepción para clientes nuevos o sin historial
    if suma_compras == 0:
        limite_final = cupo_base_inicial
        promedio_semanal = 0.0
    else:
        # Limite = Ps * (1 + (factor_holgura / 100))
        limite_final = promedio_semanal * (1 + (factor_holgura / 100.0))

    return {
        "promedio_semanal": round(promedio_semanal, 2),
        "limite_permitido": round(limite_final, 2)
    }

def get_or_create_client_by_placa(db: Session, placa: str):
    cliente = db.query(Cliente).filter(Cliente.placa_vehiculo == placa).first()
    if not cliente:
        # Registrar automáticamente si no existe (datos genéricos)
        cliente = Cliente(
            ci_nit="0000000",
            nombre_completo="CLIENTE NUEVO",
            placa_vehiculo=placa.upper(),
            tipo_cliente="Particular",
            estado="Activo"
        )
        db.add(cliente)
        db.commit()
        db.refresh(cliente)
    return cliente
