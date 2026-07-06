from datetime import date
from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class BillingCadence(str, Enum):
    """Supported subscription billing cycles."""
    MONTHLY = "monthly"
    YEARLY = "yearly"
    QUARTERLY = "quarterly"
    OTHER = "other"

class ExecutionStatus(str, Enum):
    """Current status of the subscription analyst execution flow."""
    IDLE = "idle"
    ANALYZING = "analyzing"
    NEGOTIATING = "negotiating"
    COMPLETED = "completed"
    FAILED = "failed"

class SubscriptionItem(BaseModel):
    """Represents a subscription service details."""
    vendor: str = Field(
        ..., 
        description="The name of the vendor/service provider (e.g., Netflix, AWS)."
    )
    monthly_cost: float = Field(
        ..., 
        ge=0.0, 
        description="The cost of the subscription normalized to a monthly rate."
    )
    cadence: BillingCadence = Field(
        default=BillingCadence.MONTHLY, 
        description="The billing cycle frequency."
    )
    last_billing_date: date = Field(
        ..., 
        description="The date of the last billing event."
    )

class VendorPolicy(BaseModel):
    """Represents the policies and support info associated with a vendor."""
    retention_offers: List[str] = Field(
        default_factory=list, 
        description="Known retention offers or discounts the vendor provides."
    )
    cancel_terms: str = Field(
        ..., 
        description="The terms and conditions for canceling the subscription."
    )
    support_email: Optional[str] = Field(
        default=None, 
        description="The customer support or cancellation email for the vendor."
    )

class NegotiationStrategy(BaseModel):
    """Represents the strategic approach for negotiating a subscription."""
    target_price: float = Field(
        ..., 
        ge=0.0, 
        description="The target monthly price we want to achieve."
    )
    leverage_points: List[str] = Field(
        default_factory=list, 
        description="Points of leverage to mention during negotiation (e.g., competitor pricing)."
    )
    draft_email_body: str = Field(
        ..., 
        description="The prepared draft email body to send to the vendor support."
    )

class SubscriptionState(BaseModel):
    """The global context data-bus coordinating all collections and execution state."""
    subscriptions: List[SubscriptionItem] = Field(
        default_factory=list, 
        description="List of tracked subscription items."
    )
    vendor_policies: Dict[str, VendorPolicy] = Field(
        default_factory=dict, 
        description="Vendor policies keyed by vendor name."
    )
    negotiation_strategies: Dict[str, NegotiationStrategy] = Field(
        default_factory=dict, 
        description="Negotiation strategies keyed by vendor name."
    )
    execution_status: ExecutionStatus = Field(
        default=ExecutionStatus.IDLE, 
        description="Current execution status of the subscription analyst."
    )
