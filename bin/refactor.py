import json


def remove_bind_indicators(project):
    for layout in project["layouts"]:
        original_instances = layout["instances"]
        new_instances = [
            instance
            for instance in original_instances
            if instance["name"] != "BindIndicator"
        ]
        layout["instances"] = new_instances


def remove_non_global_counters(project):
    for layout in project["layouts"]:
        original_instances = layout["objects"]
        new_instances = [
            instance
            for instance in original_instances
            if instance["name"] not in ("Unbound_Val", "Unbound_Desc")
        ]
        layout["objects"] = new_instances


def position_reminders(project):
    for layout in project["layouts"]:
        for instance in layout["instances"]:
            if instance["name"] != "ResetReminder":
                continue
            instance["x"] = 355
            instance["y"] = 530


def position_counters(project):
    for layout in project["layouts"]:
        for instance in layout["instances"]:
            if instance["name"] == "Unbound_Desc":
                instance["x"] = 575
                instance["y"] = 20
                instance["layer"] = "UI"
            elif instance["name"] == "Unbound_Val":
                instance["x"] = 745
                instance["y"] = 20
                instance["layer"] = "UI"


OPERATIONS = [
    remove_bind_indicators,
    position_reminders,
    position_counters,
    remove_non_global_counters,
]


def main(args):
    operation = [op for op in OPERATIONS if op.__name__ == args.operation][0]

    project = None
    with open("./unbound.json") as project_file:
        project = json.load(project_file)

    operation(project)

    with open("./unbound.refactor.json", "w") as project_file:
        json.dump(
            project,
            project_file,
            # sort_keys=True,
            indent=2,
        )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "operation", choices=[op.__name__ for op in OPERATIONS],
    )

    main(parser.parse_args())
