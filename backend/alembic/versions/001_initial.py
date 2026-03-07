"""Initial schema

Revision ID: 001_initial
Revises: 
Create Date: 2026-03-08 15:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('phone', sa.String(20), unique=True, nullable=False, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(100), unique=True, nullable=True),
        sa.Column('delivery_platform', sa.String(50), nullable=False),
        sa.Column('work_city', sa.String(100), nullable=True),
        sa.Column('work_zone', sa.String(100), nullable=True),
        sa.Column('work_location_lat', sa.Float, nullable=True),
        sa.Column('work_location_lng', sa.Float, nullable=True),
        sa.Column('kyc_status', sa.String(20), default='pending', nullable=False),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('risk_score', sa.Float, default=0.5, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create policies table
    op.create_table(
        'policies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('policy_number', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('start_date', sa.Date, nullable=False),
        sa.Column('end_date', sa.Date, nullable=False),
        sa.Column('status', sa.String(20), default='active', nullable=False),
        sa.Column('weekly_premium', sa.Float, nullable=False),
        sa.Column('coverage_amount', sa.Float, default=800.0, nullable=False),
        sa.Column('coverage_type', sa.String(50), default='income_loss_only', nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create disruptions table
    op.create_table(
        'disruptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('disruption_type', sa.String(20), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('zone', sa.String(100), nullable=True),
        sa.Column('location_lat', sa.Float, nullable=True),
        sa.Column('location_lng', sa.Float, nullable=True),
        sa.Column('affected_radius_km', sa.Float, nullable=True),
        sa.Column('start_time', sa.DateTime, nullable=False),
        sa.Column('end_time', sa.DateTime, nullable=True),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_disruptions_active', 'disruptions', ['is_active', 'city'])

    # Create claims table
    op.create_table(
        'claims',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('claim_number', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('policy_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('policies.id'), nullable=False),
        sa.Column('disruption_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('disruptions.id'), nullable=True),
        sa.Column('claim_date', sa.Date, nullable=False),
        sa.Column('claim_amount', sa.Float, nullable=False),
        sa.Column('status', sa.String(20), default='pending', nullable=False),
        sa.Column('approval_type', sa.String(20), nullable=True),
        sa.Column('approved_at', sa.DateTime, nullable=True),
        sa.Column('payout_date', sa.DateTime, nullable=True),
        sa.Column('payout_transaction_id', sa.String(100), nullable=True),
        sa.Column('fraud_score', sa.Float, default=0.0, nullable=False),
        sa.Column('peer_validation_count', sa.Integer, default=0, nullable=False),
        sa.Column('location_verified', sa.Boolean, default=False, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index('idx_claims_status', 'claims', ['status', 'user_id'])

    # Create risk_zones table
    op.create_table(
        'risk_zones',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('zone_id', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('zone_name', sa.String(100), nullable=True),
        sa.Column('center_lat', sa.Float, nullable=False),
        sa.Column('center_lng', sa.Float, nullable=False),
        sa.Column('weather_risk_score', sa.Float, default=0.5, nullable=False),
        sa.Column('traffic_risk_score', sa.Float, default=0.5, nullable=False),
        sa.Column('historical_risk_score', sa.Float, default=0.5, nullable=False),
        sa.Column('social_risk_score', sa.Float, default=0.5, nullable=False),
        sa.Column('overall_risk_score', sa.Float, default=0.5, nullable=False),
        sa.Column('active_workers_count', sa.Integer, default=0, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index('idx_risk_zones_city', 'risk_zones', ['city'])

    # Create premium_history table
    op.create_table(
        'premium_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('policy_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('policies.id'), nullable=False),
        sa.Column('week_start_date', sa.Date, nullable=False),
        sa.Column('base_premium', sa.Float, nullable=False),
        sa.Column('risk_adjustment', sa.Float, default=0.0, nullable=False),
        sa.Column('seasonal_adjustment', sa.Float, default=0.0, nullable=False),
        sa.Column('loyalty_discount', sa.Float, default=0.0, nullable=False),
        sa.Column('safe_behavior_bonus', sa.Float, default=0.0, nullable=False),
        sa.Column('final_premium', sa.Float, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_premium_history_user_date', 'premium_history', ['user_id', 'week_start_date'])


def downgrade() -> None:
    op.drop_table('premium_history')
    op.drop_table('risk_zones')
    op.drop_table('claims')
    op.drop_table('disruptions')
    op.drop_table('policies')
    op.drop_table('users')
