from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./estacion_servicio.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class EmpresaConfiguracion(Base):
    __tablename__ = "empresa_configuracion"
    id_config = Column(Integer, primary_key=True, index=True)
    nombre_estacion = Column(String)
    nit = Column(String)
    direccion = Column(String)
    ciudad = Column(String)
    contacto = Column(String)
    factor_holgura = Column(Float, default=10.0) # En porcentaje
    cupo_base_inicial = Column(Float, default=50.0) # Litros para nuevos clientes

class Tanque(Base):
    __tablename__ = "tanques"
    id_tanque = Column(Integer, primary_key=True, index=True)
    identificador = Column(String, unique=True, index=True)
    tipo_carburante = Column(String) # 'Gasolina' o 'Diésel'
    capacidad_maxima = Column(Float)
    stock_minimo_seguridad = Column(Float)
    stock_actual = Column(Float)

    ventas = relationship("VentaControlada", back_populates="tanque")
    ingresos = relationship("IngresoAbastecimiento", back_populates="tanque")

class Cliente(Base):
    __tablename__ = "clientes"
    id_cliente = Column(Integer, primary_key=True, index=True)
    ci_nit = Column(String)
    nombre_completo = Column(String)
    placa_vehiculo = Column(String, unique=True, index=True)
    tipo_cliente = Column(String) # 'Particular', 'Transporte Público', 'Empresa'
    estado = Column(String, default="Activo") # 'Activo', 'Suspendido'

    ventas = relationship("VentaControlada", back_populates="cliente")

class IngresoAbastecimiento(Base):
    __tablename__ = "ingresos_abastecimiento"
    id_ingreso = Column(Integer, primary_key=True, index=True)
    id_tanque = Column(Integer, ForeignKey("tanques.id_tanque"))
    cantidad_litros = Column(Float)
    nro_factura_remision = Column(String)
    fecha_hora = Column(DateTime, default=datetime.datetime.utcnow)

    tanque = relationship("Tanque", back_populates="ingresos")

class VentaControlada(Base):
    __tablename__ = "ventas_controladas"
    id_venta = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"))
    id_tanque = Column(Integer, ForeignKey("tanques.id_tanque"))
    cantidad_litros = Column(Float)
    promedio_semanal_calculado = Column(Float)
    limite_permitido_calculado = Column(Float)
    fecha_hora = Column(DateTime, default=datetime.datetime.utcnow)

    cliente = relationship("Cliente", back_populates="ventas")
    tanque = relationship("Tanque", back_populates="ventas")

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Inicializar configuración global si no existe
    if db.query(EmpresaConfiguracion).count() == 0:
        conf = EmpresaConfiguracion(
            nombre_estacion="Estación Central GNV/Líquidos",
            nit="123456789-0",
            direccion="Av. Principal #123",
            ciudad="Cochabamba",
            contacto="+591 4444444",
            factor_holgura=10.0,
            cupo_base_inicial=50.0
        )
        db.add(conf)
        db.commit()
    db.close()
