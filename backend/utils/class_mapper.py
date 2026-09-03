"""
CoastX Class Mapping and Color Standards
Authoritative class mapper and color provider for CoastX target classes.
Target classes: Person, Plastic, Boat.
"""

def map_to_target_class(raw_class_name: str) -> str | None:
    """
    Maps raw model class names to authoritative CoastX target classes:
    - 'swimmer', 'person', 'people' -> 'Person'
    - 'trash', 'plastic', 'debris', 'garbage', 'plastic_bottle', 'plastic_bag' -> 'Plastic'
    - 'boat', 'vessel', 'ship' -> 'Boat'
    Returns None if the class is not one of the 3 CoastX target classes (e.g. 'buoy', 'sinker').
    """
    if not raw_class_name:
        return None
    cls = str(raw_class_name).lower().strip()
    if cls in ["person", "swimmer", "people"]:
        return "Person"
    elif cls in ["plastic", "trash", "debris", "garbage", "plastic_bottle", "plastic_bag"]:
        return "Plastic"
    elif cls in ["boat", "vessel", "ship"]:
        return "Boat"
    return None


def get_class_bgr_color(target_class_name: str):
    """
    Returns OpenCV BGR color tuple for CoastX target classes:
    - Person: RED (0, 0, 255)
    - Plastic: BLUE (255, 0, 0)
    - Boat: ORANGE (0, 165, 255)
    """
    cls = str(target_class_name).strip().capitalize()
    if cls == "Person":
        return (0, 0, 255)       # BGR RED
    elif cls == "Plastic":
        return (255, 0, 0)       # BGR BLUE
    elif cls == "Boat":
        return (0, 165, 255)     # BGR ORANGE
    return (200, 200, 200)       # Gray default for unexpected
