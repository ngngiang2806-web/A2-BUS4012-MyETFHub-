from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import SupabaseDatabaseError, SupabaseRepository, get_repository, raise_database_error
from app.schemas import DeleteResponse, HoldingCreate, HoldingResponse, HoldingUpdate

router = APIRouter(tags=["ETF holdings"])


@router.post("/etf-holdings", response_model=HoldingResponse, status_code=status.HTTP_201_CREATED)
async def create_holding(
    payload: HoldingCreate,
    repository: SupabaseRepository = Depends(get_repository),
) -> dict:
    try:
        return await repository.create_holding(payload.model_dump(mode="json"))
    except SupabaseDatabaseError as error:
        raise_database_error(error)


@router.get("/etf-holdings", response_model=list[HoldingResponse])
async def list_holdings(
    repository: SupabaseRepository = Depends(get_repository),
) -> list[dict]:
    try:
        return await repository.list_holdings()
    except SupabaseDatabaseError as error:
        raise_database_error(error)


@router.get("/etf-holdings/{holding_id}", response_model=HoldingResponse)
async def read_holding(
    holding_id: UUID,
    repository: SupabaseRepository = Depends(get_repository),
) -> dict:
    try:
        holding = await repository.get_holding(str(holding_id))
    except SupabaseDatabaseError as error:
        raise_database_error(error)

    if holding is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ETF holding not found.")
    return holding


@router.put("/etf-holdings/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    holding_id: UUID,
    payload: HoldingUpdate,
    repository: SupabaseRepository = Depends(get_repository),
) -> dict:
    try:
        holding = await repository.update_holding(
            str(holding_id), payload.model_dump(exclude_unset=True, mode="json")
        )
    except SupabaseDatabaseError as error:
        raise_database_error(error)

    if holding is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ETF holding not found.")
    return holding


@router.delete("/etf-holdings/{holding_id}", response_model=DeleteResponse)
async def delete_holding(
    holding_id: UUID,
    repository: SupabaseRepository = Depends(get_repository),
) -> DeleteResponse:
    try:
        deleted = await repository.delete_holding(str(holding_id))
    except SupabaseDatabaseError as error:
        raise_database_error(error)

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ETF holding not found.")
    return DeleteResponse(message="ETF holding deleted successfully.")