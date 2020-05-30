import json


def main():
    project = None
    with open("./unbound.json") as project_file:
        project = json.load(project_file)

    remove_bind_indicators(project)

    with open("./refactor-unbound.json", "w") as project_file:
        project = json.dump(project, project_file)


def remove_bind_indicators(project):
    for layout in project["layouts"]:
        original_instances = layout["instances"]
        new_instances = [
            instance
            for instance in original_instances
            if instance["name"] != "BindIndicator"
        ]
        layout["instances"] = new_instances


if __name__ == "__main__":
    main()
