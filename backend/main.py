from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import database, rules
from .database import SessionLocal, init_db, EmpresaConfiguracion, Tanque, Cliente, VentaControlada, IngresoAbastecimiento
from typing import List
import datetime

# Inicializar DB
init_db()

app = FastAPI(title="Sistema de Gestión de Carburantes (SGIC)")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ENDPOINTS CONFIGURACION ---
@app.get("/config")
def get_config(db: Session = Depends(get_db)):
    return db.query(EmpresaConfiguracion).first()

@app.put("/config")
def update_config(config_data: dict, db: Session = Depends(get_db)):
    config = db.query(EmpresaConfiguracion).first()
    for key, value in config_data.items():
        if hasattr(config, key):
            setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return config

# --- ENDPOINTS TANQUES ---
@app.get("/tanques")
def list_tanques(db: Session = Depends(get_db)):
    return db.query(Tanque).all()

@app.post("/tanques")
def create_tanque(tanque: dict, db: Session = Depends(get_db)):
    db_tanque = Tanque(**tanque)
    db.add(db_tanque)
    db.commit()
    return db_tanque

@app.post("/tanques/reabastecer")
def reabastecer_tanque(data: dict, db: Session = Depends(get_db)):
    tanque = db.query(Tanque).filter(Tanque.id_tanque == data['id_tanque']).first()
    if not tanque:
        raise HTTPException(status_code=404, detail="Tanque no encontrado")
    
    ingreso = IngresoAbastecimiento(
        id_tanque=data['id_tanque'],
        cantidad_litros=data['cantidad_litros'],
        nro_factura_remision=data['nro_factura_remision']
    )
    tanque.stock_actual += data['cantidad_litros']
    db.add(ingreso)
    db.commit()
    return {"message": "Reabastecimiento exitoso", "nuevo_stock": tanque.stock_actual}

# --- ENDPOINTS CLIENTES ---
@app.get("/clientes")
def list_clientes(db: Session = Depends(get_db)):
    return db.query(Cliente).all()

@app.put("/clientes/{id_cliente}/estado")
def update_cliente_status(id_cliente: int, estado: str = Body(..., embed=True), db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    cliente.estado = estado
    db.commit()
    return cliente

# --- ENDPOINTS TRANSACCIONES (PUNTO DE VENTA) ---
@app.get("/venta/validar/{placa}")
def validar_cupo(placa: str, db: Session = Depends(get_db)):
    cliente = rules.get_or_create_client_by_placa(db, placa)
    
    if cliente.estado == 'Suspendido':
        return {
            "habilitado": False,
            "motivo": "El cliente se encuentra SUSPENDIDO.",
            "cliente": cliente
        }
    
    quota_info = rules.calculate_client_quota(db, cliente.id_cliente)
    
    return {
        "habilitado": True,
        "cliente": cliente,
        "promedio_semanal": quota_info["promedio_semanal"],
        "limite_permitido": quota_info["limite_permitido"]
    }

@app.post("/venta/procesar")
def procesar_venta(venta_data: dict, db: Session = Depends(get_db)):
    # 1. Validar cliente y cupo
    cliente = db.query(Cliente).filter(Cliente.id_cliente == venta_data['id_cliente']).first()
    tanque = db.query(Tanque).filter(Tanque.id_tanque == venta_data['id_tanque']).first()
    
    if not cliente or not tanque:
        raise HTTPException(status_code=404, detail="Cliente o Tanque no encontrado")

    quota_info = rules.calculate_client_quota(db, cliente.id_cliente)
    
    if venta_data['cantidad_litros'] > quota_info['limite_permitido']:
        raise HTTPException(status_code=400, detail="La cantidad excede el límite permitido")

    if tanque.stock_actual < venta_data['cantidad_litros']:
        raise HTTPException(status_code=400, detail="Stock insuficiente en tanque")

    # 2. Registrar venta
    nueva_venta = VentaControlada(
        id_cliente=cliente.id_cliente,
        id_tanque=tanque.id_tanque,
        cantidad_litros=venta_data['cantidad_litros'],
        promedio_semanal_calculado=quota_info['promedio_semanal'],
        limite_permitido_calculado=quota_info['limite_permitido']
    )
    
    # 3. Descontar stock
    tanque.stock_actual -= venta_data['cantidad_litros']
    
    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)
    
    return {
        "message": "Venta procesada con éxito",
        "nro_transaccion": nueva_venta.id_venta,
        "fecha": nueva_venta.fecha_hora
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
