import backend.db as db


def main():
    db.write_object_to_db('1234', {'a': 'thingy', 'b': 'another thingy', 'c': 1.234}, 'posts')
    


main()
