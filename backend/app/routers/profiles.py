from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import AuthenticatedUser, get_authenticated_user
from app.database import SupabaseDatabaseError, SupabaseRepository, get_repository, raise_database_error
from app.schemas import ProfileCreate, ProfileResponse, ProfileUpdate

router = APIRouter(tags=["Investor profile"])


@router.post("/investor-profile", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_profile(
    payload: ProfileCreate,
    user: AuthenticatedUser = Depends(get_authenticated_user),
    repository: SupabaseRepository = Depends(get_repository),
) -> dict:
    if str(payload.email_address).lower() != user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address must match the authenticated Supabase account.",
        )

    try:
        profile = payload.model_dump(mode="json")
        # Ownership and the stored account email always come from the verified token,
        # never from a client-controlled request value.
        profile["email_address"] = user.email
        return await repository.upsert_profile(profile)
    except SupabaseDatabaseError as error:
        raise_database_error(error)


@router.get("/investor-profile", response_model=ProfileResponse)
async def read_profile(
    repository: SupabaseRepository = Depends(get_repository),
) -> dict:
    try:
        profile = await repository.get_profile()
    except SupabaseDatabaseError as error:
        raise_database_error(error)

    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investor profile not found.")
    return profile


@router.put("/investor-profile", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    repository: SupabaseRepository = Depends(get_repository),
) -> dict:
    try:
        profile = await repository.update_profile(payload.model_dump(exclude_unset=True, mode="json"))
    except SupabaseDatabaseError as error:
        raise_database_error(error)

    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investor profile not found.")
    return profile